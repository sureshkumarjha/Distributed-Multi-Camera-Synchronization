import React, { lazy, useState  } from 'react'
import { Link } from 'react-router-dom'
import  {
  CContainer,
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CCallout,
  CSwitch,
  CLink,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,CFormGroup,CFormText,CInput,CLabel, CCardImg,
  CToast,CToastBody,CToastHeader,CToaster,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import logo from '../../assets/images/logo.png'
import empty from '../../assets/images/empty.png'

const Settings = (props) => {
  const dispatch = useDispatch()
  const cameraList = useSelector(state => state.cameraList)
  
  let camera = {
    camera_name : `Default Camera ${cameraList.length + 1}`,
    camera_location : "",
    camera_path:"",
    description: "",
    show : true,
    isProcessing: true,
    isEntryPoint : false,
    priority : false,
    isNew : true,
    camera_date_time:"",
  }

  const [selectedCamera ,setSelectedCamera] = useState(camera)

  const [modal, setModal] = useState(false)

  const handleOnChange = event => {
    const {name , value} = event.target
    setSelectedCamera({...selectedCamera,[name]:event.target.value })
  }; 

  const onAddCamera = () =>{
    axios.post("/react_add_camera",{ "camInfo" : {...selectedCamera,isNew:false} }).then(
      (res)=>{
        console.log(res.data)
        if(res.data.status){
          dispatch({type: 'ADD_CAMERA', payload: {...selectedCamera,isNew:false}})
          addToast(
            { position: 'bottom-left', 
            autohide: 3000 ,
            header: "Notification", 
            msg : "Camera Added"}
            )
            setModal(false)
        }else{
          console.log("not added")
        }
      }
    ).catch(
      function (error){
        console.log(error)
      }
    )
  }

  const onUpdateCamera = () =>{
    axios.post("/react_update_camera",{ "camInfo" : {...selectedCamera,isNew:false},
    "camID" : selectedCamera.camera_index
  }).then(
      (res)=>{
        console.log(res.data)
        if(res.data.status){
          dispatch({type: 'UPDATE_CAMERA', payload: selectedCamera})
          addToast(
            { position: 'bottom-left', 
            autohide: 3000 ,
            header: "Notification", 
            msg : "Camera Updated"}
            )
            setModal(false)
        }else{
          console.log("not added")
        }
      }
    ).catch(
      function (error){
        console.log(error)
      }
    )
    
  }
  const onStartProcessing = (camera,camID) =>{
    axios.post("/start_processing",{ "camID" : camID }).then(
      (res)=>{
        console.log(res.data)
        if(res.data.status){
          dispatch({type: 'UPDATE_CAMERA', payload: {...camera,camera_index : camID,show : !camera.show , isProcessing : true}})
          // addToast(
          //   { position: 'bottom-left', 
          //   autohide: 3000 ,
          //   header: "Notification", 
          //   msg : "Camera Added"}
          //   )
        }else{
          console.log("not started")
        }
      }
    ).catch(
      function (error){
        console.log(error)
      }
    )
  }

  const onStopProcessing = (camera,camID) =>{
    axios.post("/stop_processing",{ "camID" : camID }).then(
      (res)=>{
        console.log(res.data)
        if(res.data.status){
          dispatch({type: 'UPDATE_CAMERA', payload: {...camera,camera_index : camID,show : !camera.show , isProcessing : false}})
          // addToast(
          //   { position: 'bottom-left', 
          //   autohide: 3000 ,
          //   header: "Notification", 
          //   msg : "Camera Added"}
          //   )
        }else{
          console.log("not started")
        }
      }
    ).catch(
      function (error){
        console.log(error)
      }
    )
  }

  const onRemoveCamera = (camera,camID) =>{
    camID = selectedCamera.camera_index;
    console.log(camID)
    axios.post("/react_remove_camera",{ "camID" : camID }).then(
      (res)=>{
        console.log(res.data)
        if(res.data.status){
          dispatch({type: 'REMOVE_CAMERA', payload: {...selectedCamera,camera_index : camID,show : !camera.show}})
          addToast(
            { position: 'bottom-left', 
            autohide: 3000 ,
            header: "Notification", 
            msg : "Camera Removed"}
            )
            setModal(false)
        }else{
          console.log("not started")
        }
      }
    ).catch(
      function (error){
        console.log(error)
      }
    )
  }


  const [toasts, setToasts] = useState([
    // { position: 'bottom-left', autohide: 3000 }
  ])

  const addToast = (val) => {
    setToasts([
      ...toasts, 
      val
    ])
  }



  const toasters = (()=>{
    return toasts.reduce((toasters, toast) => {
      toasters[toast.position] = toasters[toast.position] || []
      toasters[toast.position].push(toast)
      return toasters
    }, {})
  })()
  console.log("Selected camera",selectedCamera)
  return (
    <div className="flex-row">
      <CContainer>   
        <CModal 
        show={modal} 
        onClose={setModal}
        >
        <CModalHeader closeButton>
          <CModalTitle>Tweak Camera</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CForm action="" method="post">

            <CFormGroup>
              <CLabel htmlFor="nf-email">Camera Name</CLabel>
              <CInput  
              id="camera_name" 
              name="camera_name" 
              value ={selectedCamera.camera_name} 
              placeholder="Camera Name" 
              onChange = {handleOnChange}
              />
              
            </CFormGroup>

            <CFormGroup>
              <CLabel htmlFor="nf-password">Camera Location</CLabel>
              <CInput  
              id="camera_location" 
              name="camera_location" 
              value ={selectedCamera.camera_location} 
              placeholder="Front Gate/Back Gate/Building Enterance" 
              onChange = {handleOnChange}
            />
            </CFormGroup>

            <CFormGroup>
              <CLabel htmlFor="nf-password">Camera Path</CLabel>
              <CInput  
              id="camera_path" 
              name="camera_path" 
              value ={selectedCamera.camera_path} 
              placeholder="Ip Address/File location" 
              onChange = {handleOnChange}
              disabled = {(selectedCamera.isNew) ? false: true}
              />
            </CFormGroup>
            </CForm>
            <CForm  className="form-horizontal">
            <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="hf-password">Entry Point</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                  <CSwitch className={'mx-1'} variant={'3d'} color={'success'} 
                    checked = {selectedCamera.isEntryPoint} 
                    onChange = {
                      ()=>{
                        setSelectedCamera({...selectedCamera,isEntryPoint:!selectedCamera.isEntryPoint})
                      }
                    }
                  />
                    <CFormText className="help-block">Is this Entry point to the surveillance system ? (eg. Entry Gate)</CFormText>
                  </CCol>
              </CFormGroup>
              <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="hf-email">Smart Sense </CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                  <CSwitch className={'mx-1'} variant={'3d'} color={'success'} 
                    checked = {selectedCamera.isProcessing} 
                    onChange = {
                      ()=>{
                        setSelectedCamera({...selectedCamera,isProcessing:!selectedCamera.isProcessing})
                      }
                    }
                  />
                    <CFormText className="help-block">Enable Smart Tracking and Inturter detection on this Camera ?</CFormText>
                  </CCol>
                </CFormGroup>

            </CForm>
            {
              (selectedCamera.isNew)?
              <></>:
              <CButton color="danger" 
              onClick = {onRemoveCamera}
            >
          Delete
          </CButton>
          }
            
          
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" 
          onClick = {
            ()=>{
              if(selectedCamera.isNew){
                onAddCamera()
              }else{
                onUpdateCamera()
              }
              setModal(false)
            }
          }>
          Save
          </CButton>{' '}
          <CButton 
            color="secondary" 
            onClick={() => setModal(false)}
          >Cancel</CButton>
        </CModalFooter>
      </CModal>

        {Object.keys(toasters).map((toasterKey) => (
          <CToaster
            position={toasterKey}
            key={'toaster' + toasterKey}
          >
            {
              toasters[toasterKey].map((toast, key)=>{
              return(
                <CToast
                  key={'toast' + key}
                  show={true}
                  autohide={toast.autohide}
                  fade={toast.fade}
                >
                  <CToastHeader closeButton={toast.closeButton}>
                    {toast.header}
                  </CToastHeader>
                  <CToastBody>
                    {toast.msg}
                  </CToastBody>
                </CToast>
              )
            })
            }
          </CToaster>
        ))}

        <CRow className="justify-content-center">
        <CCol>
        <h3>Cameras Settings</h3>
          <CCard>
            {/* <CCardHeader>
              Cameras Settings
            </CCardHeader> */}
            <CCardBody>
              <CRow>
              {
                (cameraList.length == 0)?
                <div className="text-center"
                style={{
                  width:"100%"
                }}
                >
                <img 
                  src = {empty}
                  style={{
                    height:"10em",
                    width:"10em",
                    borderRadius:"100%",
                    objectFit:"cover",    
                    boxShadow: "-4px 0px 0px 0px #b9b9b9",
                  }}
                />
                <div>
                No Cameras Added
                </div>
                </div>
                :
                <></>
              }
                {
                  cameraList.map((camera,idx)=>{
                    return <>
                    <CCol xs="12" sm="6" md="4" lg="6" key = {idx}>
                      <CCard accentColor="primary">
                        <CCardHeader>
                          {camera.camera_name}
                          <div className="card-header-actions flex items-center">
                              <CLink onClick={
                                () => {
                                  setSelectedCamera({...camera,camera_index : idx})
                                  setModal(true)
                                  }
                                }  className="mh2 pa0 flex items-center">
                                <CIcon name="cil-settings" />
                              </CLink>
                            <CSwitch 
                            className={'float-right mb-0'} 
                            color={'info'} 
                            checked = {camera.isProcessing} 
                            size={'sm'} 
                            tabIndex="0" 
                            onChange={
                              ()=>{
                                if(camera.isProcessing === true){
                                    onStopProcessing(camera,idx)
                                }else{
                                    onStartProcessing(camera,idx)
                                }
                              }
                            }
                            />
                          </div>

                        </CCardHeader>
                        <CCardBody
                        className="tc ma1"
                        >

                          <img 
                          src={`/video_streamer/${idx.toString()}`} 
                          height={"400px"}
                          />

                        </CCardBody>
                      </CCard>
                    </CCol>
                    </>
                  })
                }
                
                
              </CRow>
            </CCardBody>
            <CCardFooter>
              <CButton  size="md" color="primary" 
              onClick = {
                ()=>{
                  let d = new Date();
                  setSelectedCamera({...camera,camera_date_time: d.toDateString() + " " + d.toLocaleTimeString() })
                  setModal(true)
                }
              }
              >+ Add Camera</CButton>
            </CCardFooter>
          </CCard>
          <CCard>

            <CCardBody>
            <CListGroup>
                <CListGroupItem className="justify-content-between flex items-center">
                  Enable Smart Sense for all the cameras
   
                  <CSwitch className={'mx-1 float-right'} variant={'3d'} color={'success'} 
                    // checked = {} 
                    onChange = {
                      ()=>{
                       
                      }
                    }
                  />
                </CListGroupItem>
              </CListGroup>
            </CCardBody>

          </CCard>
        </CCol>
      
        </CRow>
      </CContainer>
    </div>
  )
}

export default Settings