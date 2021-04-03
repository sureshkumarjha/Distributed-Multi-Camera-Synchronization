import React, { lazy, useState  } from 'react'
import {
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
import CIcon from '@coreui/icons-react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import MainChartExample from '../charts/MainChartExample.js'
import logo from '../../assets/images/logo.png'
import socketIOClient from "socket.io-client";


const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'))
const WidgetsBrand = lazy(() => import('../widgets/WidgetsBrand.js'))


const ENDPOINT = "http://localhost:5000/surveillance";

const Dashboard = () => {
  const dispatch = useDispatch()
  const cameraList = useSelector(state => state.cameraList)
  
  // const socket = socketIOClient(ENDPOINT);
  // console.log(socket)
  // socket.on("system_data", data => {
  //   console.log(data)
  // });
  // socket.on("system_monitoring", data => {
  //   console.log(data)
  // });

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

  const onView = (idx) =>{
    console.log("Clicked")
    setSelectedCamera({...cameraList[idx],camera_index : idx})
    setModal(true)
  }

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

  console.log(cameraList)
  return (
    <>
      <WidgetsDropdown />
      {
        (modal)?
        <div className="custom-modal">
        <CCard>
            <CCardHeader style = {{ 
              height: "7vh",
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between"
              }}>
              {selectedCamera.camera_name}
              <div className="card-header-actions flex items-center">
              <CButton variant="outline" color="dark" onClick = {()=>{
                setModal(false)
              }}>
              <CIcon name="cil-x" />
              </CButton>
              </div>
            </CCardHeader>
          <CCardBody style = {{
            height: "92vh",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            }}>
            {
              (selectedCamera.show && modal)?
              <img src={`/video_streamer/${selectedCamera.camera_index}`} style={{
                height:"100%"
              }} />
              :
              <img src={logo} style={{
                height:"100%"
              }}/>
            }
          </CCardBody>
        </CCard>
      </div>
      :
      <></>
      }

      {/* <CModal 
        show={modal} 
        onClose={setModal}
        size="xl"
        className = "full-screen-modal"
        style={{color:"red"}}
        scrollable = {false}
        centered={false}
      >
        <CModalHeader closeButton>
          <CModalTitle>{selectedCamera.camera_name}</CModalTitle>
        </CModalHeader>
        {
          (selectedCamera.show && modal)?
          <img src={`/video_streamer/${selectedCamera.camera_index}`} />
          :
          <img src={logo} />
        }
        <CModalBody>
          
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setModal(false)}
          >Close</CButton>
        </CModalFooter>
      </CModal> */}

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

      <br />

    <table className="table table-hover table-outline mb-0 d-none d-sm-table">
      <thead className="thead-light">
        <tr>
          <th className="text-center"><CIcon name="cil-people" /></th>
          <th>Camera</th>
          <th className="text-center">Location</th>
          <th>Activity</th>
          <th className="text-center">Status</th>
          <th className="text-center">View</th>
        </tr>
      </thead>
      <tbody>
      {cameraList.map((camera,idx)=>{
        return <tr>
          <td className="text-center">
            <div className="c-avatar">
              <img src={logo} className="c-avatar-img" alt="admin@bootstrapmaster.com" />
              {(camera.show)? <span className="c-avatar-status bg-success"> </span> : <> </> }
            </div>
          </td>
          <td>
            <div>{camera.camera_name}</div>
            <div className="small text-muted">
              <span>New</span> | Registered: Jan 1, 2015
            </div>
          </td>
          <td className="text-center">
          {camera.camera_location}
          </td>
          <td>
            <div className="clearfix">
              <div className="float-left">
                <strong>50%</strong>
              </div>
              <div className="float-right">
                <small className="text-muted">Jun 11, 2015 - Jul 10, 2015</small>
              </div>
            </div>
            <CProgress className="progress-xs" color="success" value="50" />
          </td>
          <td className="text-center">
            {(camera.show)? <CIcon name="cil-check" />: <CIcon name="cil-x" /> }
          </td>
          <td className="text-center" >
          <CButton 
          block shape="pill" 
          color="info"
          onClick = {
            ()=> {onView(idx)}
          }
          >View</CButton>
          </td>
        </tr>  
        })
      }
      </tbody>
    </table>

    <br />

      <CCard>
        <CCardBody>
          <CRow>
            <CCol sm="5">
              <h4 id="traffic" className="card-title mb-0">Traffic</h4>
              <div className="small text-muted">November 2017</div>
            </CCol>
            <CCol sm="7" className="d-none d-md-block">
              <CButton color="primary" className="float-right">
                <CIcon name="cil-cloud-download"/>
              </CButton>
              <CButtonGroup className="float-right mr-3">
                {
                  ['Day', 'Month', 'Year'].map(value => (
                    <CButton
                      color="outline-secondary"
                      key={value}
                      className="mx-0"
                      active={value === 'Month'}
                    >
                      {value}
                    </CButton>
                  ))
                }
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChartExample style={{height: '300px', marginTop: '40px'}}/>
        </CCardBody>
        <CCardFooter>
          <CRow className="text-center">
            <CCol md sm="12" className="mb-sm-2 mb-0">
              <div className="text-muted">Visits</div>
              <strong>29.703 Users (40%)</strong>
              <CProgress
                className="progress-xs mt-2"
                precision={1}
                color="success"
                value={40}
              />
            </CCol>
            <CCol md sm="12" className="mb-sm-2 mb-0 d-md-down-none">
              <div className="text-muted">Unique</div>
              <strong>24.093 Users (20%)</strong>
              <CProgress
                className="progress-xs mt-2"
                precision={1}
                color="info"
                value={40}
              />
            </CCol>
            <CCol md sm="12" className="mb-sm-2 mb-0">
              <div className="text-muted">Pageviews</div>
              <strong>78.706 Views (60%)</strong>
              <CProgress
                className="progress-xs mt-2"
                precision={1}
                color="warning"
                value={40}
              />
            </CCol>
            <CCol md sm="12" className="mb-sm-2 mb-0">
              <div className="text-muted">New Users</div>
              <strong>22.123 Users (80%)</strong>
              <CProgress
                className="progress-xs mt-2"
                precision={1}
                color="danger"
                value={40}
              />
            </CCol>
            <CCol md sm="12" className="mb-sm-2 mb-0 d-md-down-none">
              <div className="text-muted">Bounce Rate</div>
              <strong>Average Rate (40.15%)</strong>
              <CProgress
                className="progress-xs mt-2"
                precision={1}
                value={40}
              />
            </CCol>
          </CRow>
        </CCardFooter>
      </CCard>

      <WidgetsBrand withCharts/>

      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              Traffic {' & '} Sales
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs="12" md="6" xl="6">

                  <CRow>
                    <CCol sm="6">
                      <CCallout color="info">
                        <small className="text-muted">New Clients</small>
                        <br />
                        <strong className="h4">9,123</strong>
                      </CCallout>
                    </CCol>
                    <CCol sm="6">
                      <CCallout color="danger">
                        <small className="text-muted">Recurring Clients</small>
                        <br />
                        <strong className="h4">22,643</strong>
                      </CCallout>
                    </CCol>
                  </CRow>

                  <hr className="mt-0" />

                  <div className="progress-group mb-4">
                    <div className="progress-group-prepend">
                      <span className="progress-group-text">
                        Monday
                      </span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="info" value="34" />
                      <CProgress className="progress-xs" color="danger" value="78" />
                    </div>
                  </div>
                  <div className="progress-group mb-4">
                    <div className="progress-group-prepend">
                      <span className="progress-group-text">
                      Tuesday
                      </span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="info" value="56" />
                      <CProgress className="progress-xs" color="danger" value="94" />
                    </div>
                  </div>
                  <div className="progress-group mb-4">
                    <div className="progress-group-prepend">
                      <span className="progress-group-text">
                      Wednesday
                      </span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="info" value="12" />
                      <CProgress className="progress-xs" color="danger" value="67" />
                    </div>
                  </div>
                  <div className="progress-group mb-4">
                    <div className="progress-group-prepend">
                      <span className="progress-group-text">
                      Thursday
                      </span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="info" value="43" />
                      <CProgress className="progress-xs" color="danger" value="91" />
                    </div>
                  </div>
                  <div className="progress-group mb-4">
                    <div className="progress-group-prepend">
                      <span className="progress-group-text">
                      Friday
                      </span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="info" value="22" />
                      <CProgress className="progress-xs" color="danger" value="73" />
                    </div>
                  </div>
                  <div className="progress-group mb-4">
                    <div className="progress-group-prepend">
                      <span className="progress-group-text">
                      Saturday
                      </span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="info" value="53" />
                      <CProgress className="progress-xs" color="danger" value="82" />
                    </div>
                  </div>
                  <div className="progress-group mb-4">
                    <div className="progress-group-prepend">
                      <span className="progress-group-text">
                      Sunday
                      </span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="info" value="9" />
                      <CProgress className="progress-xs" color="danger" value="69" />
                    </div>
                  </div>
                  <div className="legend text-center">
                    <small>
                      <sup className="px-1"><CBadge shape="pill" color="info">&nbsp;</CBadge></sup>
                      New clients
                      &nbsp;
                      <sup className="px-1"><CBadge shape="pill" color="danger">&nbsp;</CBadge></sup>
                      Recurring clients
                    </small>
                  </div>
                </CCol>

                <CCol xs="12" md="6" xl="6">

                  <CRow>
                    <CCol sm="6">
                      <CCallout color="warning">
                        <small className="text-muted">Pageviews</small>
                        <br />
                        <strong className="h4">78,623</strong>
                      </CCallout>
                    </CCol>
                    <CCol sm="6">
                      <CCallout color="success">
                        <small className="text-muted">Organic</small>
                        <br />
                        <strong className="h4">49,123</strong>
                      </CCallout>
                    </CCol>
                  </CRow>

                  <hr className="mt-0" />

                  <div className="progress-group mb-4">
                    <div className="progress-group-header">
                      <CIcon className="progress-group-icon" name="cil-user" />
                      <span className="title">Male</span>
                      <span className="ml-auto font-weight-bold">43%</span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="warning" value="43" />
                    </div>
                  </div>
                  <div className="progress-group mb-5">
                    <div className="progress-group-header">
                      <CIcon className="progress-group-icon" name="cil-user-female" />
                      <span className="title">Female</span>
                      <span className="ml-auto font-weight-bold">37%</span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="warning" value="37" />
                    </div>
                  </div>
                  <div className="progress-group">
                    <div className="progress-group-header">
                      <CIcon className="progress-group-icon" name="cil-globe-alt" />
                      <span className="title">Organic Search</span>
                      <span className="ml-auto font-weight-bold">191,235 <span className="text-muted small">(56%)</span></span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="success" value="56" />
                    </div>
                  </div>


                  <div className="progress-group">
                    <div className="progress-group-header">
                      <CIcon name="cib-facebook" className="progress-group-icon" />
                      <span className="title">Facebook</span>
                      <span className="ml-auto font-weight-bold">51,223 <span className="text-muted small">(15%)</span></span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="success" value="15" />
                    </div>
                  </div>
                  <div className="progress-group">
                    <div className="progress-group-header">
                      <CIcon name="cib-twitter" className="progress-group-icon" />
                      <span className="title">Twitter</span>
                      <span className="ml-auto font-weight-bold">37,564 <span className="text-muted small">(11%)</span></span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="success" value="11" />
                    </div>
                  </div>
                  <div className="progress-group">
                    <div className="progress-group-header">
                      <CIcon name="cib-linkedin" className="progress-group-icon" />
                      <span className="title">LinkedIn</span>
                      <span className="ml-auto font-weight-bold">27,319 <span className="text-muted small">(8%)</span></span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress className="progress-xs" color="success" value="8" />
                    </div>
                  </div>
                  <div className="divider text-center">
                    <CButton color="link" size="sm" className="text-muted">
                      <CIcon name="cil-options" />
                    </CButton>
                  </div>

                </CCol>
              </CRow>



            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
