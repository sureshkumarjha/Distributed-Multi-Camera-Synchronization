import time
import argparse
import cv2
import os
import pickle
from operator import itemgetter
import numpy as np
import pandas as pd
from subprocess import Popen, PIPE
import os.path
import sys
import logging
from logging.handlers import RotatingFileHandler
import threading
import time
from datetime import datetime, timedelta
import requests
import json
import random
import math
import Camera

from queue import Queue

# comment out below line to enable tensorflow logging outputs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
physical_devices = tf.config.experimental.list_physical_devices('GPU')
if len(physical_devices) > 0:
    tf.config.experimental.set_memory_growth(physical_devices[0], True)
from absl import app, flags
from absl.flags import FLAGS
import core.utils as utils
from core.yolov4 import filter_boxes
from tensorflow.python.saved_model import tag_constants
from core.config import cfg
from PIL import Image
import cv2
import matplotlib.pyplot as plt
from tensorflow.compat.v1 import ConfigProto
from tensorflow.compat.v1 import InteractiveSession
# deep sort imports
from deep_sort import preprocessing, nn_matching
from deep_sort.detection import Detection
from deep_sort.tracker import Tracker
from tools import generate_detections as gdet
# from annoy import AnnoyIndex
# from test.check_facer import compare2faceAnnoyRecognizer

#FaceRec
# from facenet_pytorch import MTCNN
# mtcnn = MTCNN(margin=20, keep_all=True, post_process=False, device='cpu')

f = 128
# faceRecognizerAnnoy = AnnoyIndex(f, "euclidean")
# faceRecognizerAnnoy.load(r'.\newer.ann')

flags.DEFINE_string('framework', 'tf', '(tf, tflite, trt')
flags.DEFINE_string('weights', './checkpoints/yolov4-416',
                    'path to weights file')
flags.DEFINE_integer('size', 416, 'resize images to')
flags.DEFINE_boolean('tiny', False, 'yolo or yolo-tiny')
flags.DEFINE_string('model', 'yolov4', 'yolov3 or yolov4')
flags.DEFINE_string('video', './data/video/test.mp4', 'path to input video or set to 0 for webcam')
flags.DEFINE_string('output', None, 'path to output video')
flags.DEFINE_string('output_format', 'XVID', 'codec used in VideoWriter when saving video to file')
flags.DEFINE_float('iou', 0.45, 'iou threshold')
flags.DEFINE_float('score', 0.50, 'score threshold')
flags.DEFINE_boolean('dont_show', False, 'dont show video output')
flags.DEFINE_boolean('info', False, 'show detailed info of tracked objects')
flags.DEFINE_boolean('count', False, 'count objects being tracked on screen')
# Definition of the parameters
max_cosine_distance = 0.4
nn_budget = None
nms_max_overlap = 1.0

# initialize deep sort
model_filename = 'model_data/mars-small128.pb'
encoder = gdet.create_box_encoder(model_filename, batch_size=1)
# calculate cosine distance metric

# initialize tracker

# load configuration for object detector
config = ConfigProto()
config.gpu_options.allow_growth = True
session = InteractiveSession(config=config)
input_size = 416
# load tflite model if flag is set

saved_model_loaded = tf.saved_model.load('./checkpoints/yolov4-tiny-416', tags=[tag_constants.SERVING])
    
# Get paths for models
# //////////////////////////////////////////////////////////////////////////////////////////////

start = time.time()


try:
    os.makedirs('logs', exist_ok=True)  # Python>3.2
except TypeError:
    try:
        os.makedirs('logs')
    except OSError as exc:  # Python >2.5
        print("logging directory already exist")

logger = logging.getLogger()
formatter = logging.Formatter("(%(threadName)-10s) %(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler = RotatingFileHandler("logs/surveillance.log", maxBytes=10000000, backupCount=10)
handler.setLevel(logging.INFO)
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

#logging.basicConfig(level=logging.DEBUG,
#                    format='(%(threadName)-10s) %(message)s',
#                    )
                  
class SurveillanceSystem(object):
   """ The SurveillanceSystem object is the heart of this application.
   It provides all the central proccessing and ties everything
   together. It generates camera frame proccessing threads as 
   well as an alert monitoring thread. A camera frame proccessing 
   thread can process a camera using 5 different processing methods.
   These methods aim to allow the user to adapt the system to their 
   needs and can be found in the process_frame() function. The alert 
   monitoring thread continually checks the system state and takes 
   action if a particular event occurs. """ 

   def __init__(self):

        self.recogniser = None
        self.trainingEvent = threading.Event() # Used to holt processing while training the classifier 
        self.trainingEvent.set() 
        self.drawing = True 
        self.alarmState = 'Disarmed' # Alarm states - Disarmed, Armed, Triggered
        self.alarmTriggerd = False
        self.alerts = [] # Holds all system alerts
        self.cameras = [] # Holds all system cameras
        self.camerasLock  = threading.Lock() # Used to block concurrent access of cameras []
        self.cameraProcessingThreads = []
        self.peopleDB = []
        self.confidenceThreshold = 20 # Used as a threshold to classify a person as unknown


        # Initialization of alert processing thread 
        self.alertsLock = threading.Lock()
        self.alertThread = threading.Thread(name='alerts_process_thread_',target=self.alert_engine,args=())
        self.alertThread.daemon = False
        self.alertThread.start()

        # Used for testing purposes
        ###################################
        self.testingResultsLock = threading.Lock()
        self.detetectionsCount = 0
        self.trueDetections = 0
        self.counter = 0
        ####################################

        self.get_face_database_names() # Gets people in database for web client

        #//////////////////////////////////////////////////// Camera Examples ////////////////////////////////////////////////////
        #self.cameras.append(Camera.IPCamera("testing/iphoneVideos/singleTest.m4v","detect_recognise_track",False)) # Video Example - uncomment and run code
        # self.cameras.append(Camera.IPCamera("http://192.168.1.33/video.mjpg","detect_recognise_track",False))
        
        # processing frame threads 
        self.q =  Queue()
        for i, cam in enumerate(self.cameras):       
          thread = threading.Thread(name='frame_process_thread_' + str(i),target=self.process_frame,args=(cam,self.q))
          thread.daemon = False
          self.cameraProcessingThreads.append(thread)
          thread.start()

   def add_camera(self, camera):
        """Adds new camera to the System and generates a 
        frame processing thread"""
        self.cameras.append(camera)
        if camera.camInfo.get("isProcessing") == True :
            thread = threading.Thread(name='frame_process_thread_' + 
                                    str(len(self.cameras)),
                                    target=self.process_frame,
                                    args=(self.cameras[-1],self.q))
            thread.daemon = False
            self.cameraProcessingThreads.append(thread)
            # self.start_camera(len(self.cameras)-1)
            thread.start()
        else:
            self.cameras[-1].captureThread.stop = True
            self.cameras[-1].camInfo['show'] = False 

   def remove_camera(self, camID):
        """remove a camera to the System and kill its processing thread"""
        self.cameras[camID].captureThread.stop = True 
        self.cameras[camID].isDeleted = True 
        cam = self.cameras.pop(camID)

        print(cam)
        # cam.video.release()
        del cam
        self.cameraProcessingThreads.pop(camID)
        print("Camera Deleted ")

   def start_processing(self,camID):
        if self.cameras[camID].captureThread.stop == True:
            print("Start Camera processing")
            thread = threading.Thread(name='frame_process_thread_' + 
                                 str(camID),
                                 target=self.process_frame,
                                 args=(self.cameras[camID],self.q))
            thread.daemon = False
            self.cameraProcessingThreads.append(thread)
            self.cameras[camID].captureThread.stop = False
            self.cameras[camID].camInfo['isProcessing'] = True 
            print(self.cameras[camID].camInfo)
            self.cameras[camID].camInfo['show'] = True
            thread.start()


   def stop_processing(self,camID):
        print("Stop Camera processing")
        self.cameras[camID].captureThread.stop = True 
        self.cameras[camID].camInfo['isProcessing'] = False
        print(self.cameras[camID].camInfo)
        self.cameras[camID].camInfo['show'] = False 


   def process_frame(self,camera,q):
        """This function performs all the frame proccessing.
        It reads frames captured by the IPCamera instance,
        resizes them, and performs 1 of 5 functions"""
        logger.debug('Processing Frames')
        infer = saved_model_loaded.signatures['serving_default']
        metric = nn_matching.NearestNeighborDistanceMetric("cosine", max_cosine_distance, nn_budget)
        tracker = camera.tracker
        state = 1
        frame_count = 0;  
        FPScount = 0 # Used to calculate frame rate at which frames are being processed
        FPSstart = time.time()
        start = time.time()
        stop = camera.captureThread.stop   
        frame_num = 0
        while not stop:
            frame_count +=1
            logger.debug("Reading Frame")
            frame = camera.read_frame()
            if frame is None or np.array_equal(frame, camera.tempFrame):  # Checks to see if the new frame is the same as the previous frame
                continue
            frame = cv2.resize(frame,(0,0),fx= 0.7, fy =0.7, interpolation = cv2.INTER_AREA)
            height, width, channels = frame.shape
            image = Image.fromarray(frame)

            # Frame rate calculation 
            frame_num +=1
            # print('Frame #: ', frame_num)
            frame_size = frame.shape[:2]
            image_data = cv2.resize(frame, (input_size, input_size))
            image_data = image_data / 255.
            image_data = image_data[np.newaxis, ...].astype(np.float32)
            # start_time = time.time()


            # # bounding_boxes, conf, landmarks = mtcnn.detect(image, landmarks=True)
            # # compareCheck = []	

            # # if bounding_boxes is not None:
            # #     compareCheck = compare2faceAnnoyRecognizer([frame,bounding_boxes],faceRecognizerAnnoy)
            # #     for i in range(len(bounding_boxes)):
            # #         x1, y1, x2, y2 = bounding_boxes[i]
            # #         cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)),
            # #         (0, 255, 0) if compareCheck[i] else (255, 0, 0) , 2)
            # #     if landmarks is not None:
            # #         for i in range(len(landmarks)):
            # #             for p in range(landmarks[i].shape[0]):
            # #                 cv2.circle(frame, 
            # #                         (int(landmarks[i][p, 0]), int(landmarks[i][p, 1])),
            # #                         2, (255, 0, 0), -1, cv2.LINE_AA)


            # # run detections on tflite if flag is set
            # batch_data = tf.constant(image_data)
            # pred_bbox = infer(batch_data)
            # for key, value in pred_bbox.items():
            #     boxes = value[:, :, 0:4]
            #     pred_conf = value[:, :, 4:]

            # boxes, scores, classes, valid_detections = tf.image.combined_non_max_suppression(
            #     boxes=tf.reshape(boxes, (tf.shape(boxes)[0], -1, 1, 4)),
            #     scores=tf.reshape(
            #         pred_conf, (tf.shape(pred_conf)[0], -1, tf.shape(pred_conf)[-1])),
            #     max_output_size_per_class=50,
            #     max_total_size=50,
            #     iou_threshold=0.45,
            #     score_threshold=0.50
            # )

            # # convert data to numpy arrays and slice out unused elements
            # num_objects = valid_detections.numpy()[0]
            # bboxes = boxes.numpy()[0]
            # bboxes = bboxes[0:int(num_objects)]
            # scores = scores.numpy()[0]
            # scores = scores[0:int(num_objects)]
            # classes = classes.numpy()[0]
            # classes = classes[0:int(num_objects)]

            # # format bounding boxes from normalized ymin, xmin, ymax, xmax ---> xmin, ymin, width, height
            # original_h, original_w, _ = frame.shape
            # bboxes = utils.format_boxes(bboxes, original_h, original_w)

            # # store all predictions in one parameter for simplicity when calling functions
            # pred_bbox = [bboxes, scores, classes, num_objects]

            # # read in all class names from config
            # class_names = utils.read_class_names(cfg.YOLO.CLASSES)

            # # by default allow all classes in .names file
            # #allowed_classes = list(class_names.values())
            
            # # custom allowed classes (uncomment line below to customize tracker for only people)
            # allowed_classes = ['person']

            # # loop through objects and use class index to get class name, allow only classes in allowed_classes list
            # names = []
            # deleted_indx = []
            # for i in range(num_objects):
            #     class_indx = int(classes[i])
            #     class_name = class_names[class_indx]
            #     if class_name not in allowed_classes:
            #         deleted_indx.append(i)
            #     else:
            #         names.append(class_name)
            # names = np.array(names)
            # count = len(names)
            # # if FLAGS.count:
            # #     cv2.putText(frame, "Objects being tracked: {}".format(count), (5, 35), cv2.FONT_HERSHEY_COMPLEX_SMALL, 2, (0, 255, 0), 2)
            # #     print("Objects being tracked: {}".format(count))
            # # delete detections that are not in allowed_classes
            # bboxes = np.delete(bboxes, deleted_indx, axis=0)
            # scores = np.delete(scores, deleted_indx, axis=0)

            # # encode yolo detections and feed to tracker
            # features = encoder(frame, bboxes)
            # detections = [Detection(bbox, score, class_name, feature) for bbox, score, class_name, feature in zip(bboxes, scores, names, features)]

            # #initialize color map
            # cmap = plt.get_cmap('tab20b')
            # colors = [cmap(i)[:3] for i in np.linspace(0, 1, 20)]

            # # run non-maxima supression
            # boxs = np.array([d.tlwh for d in detections])
            # scores = np.array([d.confidence for d in detections])
            # classes = np.array([d.class_name for d in detections])
            # indices = preprocessing.non_max_suppression(boxs, classes, nms_max_overlap, scores)
            # detections = [detections[i] for i in indices]       

            # # Call the tracker
            # # if frame_num%30 == 0:
            # #     print("Sending to 0")
            # #     if camera.camURL == "0":
            # #         while not q.empty():
            # #             trackq = q.get()
            # #             print("Receiving",trackq.features,trackq.track_id,trackq.name)
            # #             print(trackq)
            # #             camera.tracker.add_track(trackq)
            # #     else:
            # #         for track in camera.tracker.tracks:
            # #             if track.is_confirmed():
            # #                 print("Sending",track.features,track.track_id,track.name)
            # #                 q.put(track)    
            # #     print(camera.camURL,camera.tracker.tracks)


            # tracker.predict()
            # tracker.update(detections)

         
            # # update tracks
            # for track in tracker.tracks:
            #     if not track.is_confirmed() or track.time_since_update > 1:
            #         continue 
            #     bbox = track.to_tlbr()
            #     class_name = track.get_class()
                
            # # draw bbox on screen
            #     color = colors[int(track.track_id) % len(colors)]
            #     color = [i * 255 for i in color]
                
            #     cv2.rectangle(frame, (int(bbox[0]), int(bbox[1])), (int(bbox[2]), int(bbox[3])), color, 2)
            #     cv2.rectangle(frame, (int(bbox[0]), int(bbox[1]-30)), (int(bbox[0])+(len(class_name)+len(str(track.track_id)))*17, int(bbox[1])), color, -1)
            #     cv2.putText(frame, class_name + "-" + str(track.track_id)+ "-" +str(track.name),(int(bbox[0]), int(bbox[1]-10)),0, 0.75, (255,255,255),2)

            # #calculate frames per second of running detections
            # fps = 1.0 / (time.time() - start_time)
            fps = 30
            # print("Frame_Count",frame_num)
            cv2.putText(frame, str("fps:"+ str(int(fps))), (7,40), cv2.FONT_HERSHEY_SIMPLEX , 1, (100, 255, 0), 2, cv2.LINE_AA)
            result = np.asarray(frame)
            result = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            camera.processing_frame = result
            camera.processingFPS = fps
            stop = camera.captureThread.stop
            
            
   def alert_engine(self):  
        """check alarm state -> check camera -> check event -> 
        either look for motion or look for detected faces -> take action"""
        pass
  
   def check_camera_events(self,alert):   
        """Used to check state of cameras
        to determine whether an event has occurred"""
        return False

   def take_action(self,alert): 
        """Sends email alert and/or triggers the alarm"""
        pass

   def send_email_notification_alert(self,alert):
      """ Code produced in this tutorial - http://naelshiab.com/tutorial-send-email-python/"""
      pass

   def add_face(self,name,image, upload):
      """Adds face to directory used for training the classifier"""

      return True


   def get_face_database_names(self):
      """Gets all the names that were most recently 
      used to train the classifier"""
      pass

   def change_alarm_state(self):
      """Sends Raspberry PI a resquest to change the alarm state.
      192.168.1.35 is the RPI's static IP address port 5000 is used 
      to access the flask application."""
      pass

   def trigger_alarm(self):
       pass
       """Sends Raspberry PI a resquest to change to trigger the alarm.
      192.168.1.35 is the RPI's static IP address port 5000 is used 
      to access the flask application."""

#\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
class Person(object):
    """Person object simply holds all the
    person's information for other processes
    """
    person_count = 0

    def __init__(self,rep,confidence = 0, face = None, name = "unknown"):  

        if "unknown" not in name: # Used to include unknown-N from Database
            self.identity = name
        else:
            self.identity = "unknown"
       
        self.count = Person.person_count
        self.confidence = confidence  
        self.thumbnails = []
        self.face = face
        self.rep = rep # Face representation
        if face is not None:
            ret, jpeg = cv2.imencode('.jpg', face) # Convert to jpg to be viewed by client
            self.thumbnail = jpeg.tostring()
        self.thumbnails.append(self.thumbnail) 
        Person.person_count += 1 
        now = datetime.now() + timedelta(hours=2)
        self.time = now.strftime("%A %d %B %Y %I:%M:%S%p")
        self.istracked = False
   
    def set_rep(self, rep):
        self.rep = rep

    def set_identity(self, identity):
        self.identity = identity

    def set_time(self): # Update time when person was detected
        now = datetime.now() + timedelta(hours=2)
        self.time = now.strftime("%A %d %B %Y %I:%M:%S%p")

    def set_thumbnail(self, face):
        self.face = face
        ret, jpeg = cv2.imencode('.jpg', face) # Convert to jpg to be viewed by client
        self.thumbnail = jpeg.tostring()

    def add_to_thumbnails(self, face):
        ret, jpeg = cv2.imencode('.jpg', face) # Convert to jpg to be viewed by client
        self.thumbnails.append(jpeg.tostring())


class Alert(object): 
    """Holds all the alert details and is continually checked by 
    the alert monitoring thread"""

    alert_count = 1

    def __init__(self,alarmState,camera, event, person, actions, emailAddress, confidence):   
        logger.info( "alert_"+str(Alert.alert_count)+ " created")
       

        if  event == 'Motion':
            self.alertString = "Motion detected in camera " + camera 
        else:
            self.alertString = person + " was recognised in camera " + camera + " with a confidence greater than " + str(confidence)

        self.id = "alert_" + str(Alert.alert_count)
        self.event_occurred = False
        self.action_taken = False
        self.camera = camera
        self.alarmState = alarmState
        self.event = event
        self.person = person
        self.confidence = confidence
        self.actions = actions
        if emailAddress == None:
            self.emailAddress = "bjjoffe@gmail.com"
        else:
            self.emailAddress = emailAddress

        self.eventTime = 0

        Alert.alert_count += 1

    def reinitialise(self):
        self.event_occurred = False
        self.action_taken = False

    def set_custom_alertmessage(self,message):
        self.alertString = message
