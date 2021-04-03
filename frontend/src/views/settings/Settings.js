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
} from '@coreui/react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import logo from '../../assets/images/logo.png'

const Settings = (props) => {
  const dispatch = useDispatch()
  const cameraList = useSelector(state => state.cameraList)
  
  let camera = {
    camera_name : `Default Camera ${cameraList.length + 1}`,
    camera_location : "",
    description: "",
    show : true,
    isEntryPoint : false,
    priority : false,
    isNew : true,
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
    dispatch({type: 'UPDATE_CAMERA', payload: selectedCamera})
  }
  const onStartCamera = (camera,camID) =>{
    axios.post("/start_camera",{ "camID" : camID }).then(
      (res)=>{
        console.log(res.data)
        if(res.data.status){
          dispatch({type: 'UPDATE_CAMERA', payload: {...camera,camera_index : camID,show : !camera.show}})
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

  const onStopCamera = (camera,camID) =>{
    axios.post("/stop_camera",{ "camID" : camID }).then(
      (res)=>{
        console.log(res.data)
        if(res.data.status){
          dispatch({type: 'UPDATE_CAMERA', payload: {...camera,camera_index : camID,show : !camera.show}})
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
              placeholder="Ip Address/File location" 
              onChange = {handleOnChange}
              />

            </CFormGroup>
            {
              (selectedCamera.isNew)?
              <></>:
              <CButton color="danger" 
              onClick = {onRemoveCamera}
            >
          Delete
          </CButton>
          }
            
          </CForm>
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
          <CCard>
            <CCardHeader>
              Cameras Settings
            </CCardHeader>
            <CCardBody>
              <CRow>
                {
                  cameraList.map((camera,idx)=>{
                    return <>
                    <CCol xs="12" sm="6" md="4" lg="3" key = {idx}>
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
                            checked = {camera.show} 
                            size={'sm'} 
                            tabIndex="0" 
                            onChange={
                              ()=>{
                                if(camera.show === true){
                                    onStopCamera(camera,idx)
                                }else{
                                    onStartCamera(camera,idx)
                                }
                              }
                            }
                            />
                          </div>

                        </CCardHeader>
                        <CCardBody>
                        {
                          (camera.show)?
                          <img src={`/video_streamer/${idx.toString()}`} />
                          :
                          <img src={logo} />
                        }
                        
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
                  setSelectedCamera(camera)
                  setModal(true)
                }
              }
              >+ Add Camera</CButton>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>

      </CContainer>
    </div>
  )
}

export default Settings