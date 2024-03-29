import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CFormGroup,
  CInputCheckbox,
  CLabel,
} from '@coreui/react'
import { useSelector, useDispatch} from 'react-redux'
import {loginAction} from '../../../actions'
import CIcon from '@coreui/icons-react'
import logo from '../../../assets/images/undraw1.png'
import bg from '../../../assets/images/bg-2.jpg'
import NET from 'vanta/dist/vanta.halo.min'
import axios from 'axios'


const Login = (props) => {
  const dispatch = useDispatch()

  const [user,setUser] = useState({
    userName : "",
    password : "",
    remember_me : false
  })

  const [error,setError] = useState("")

  const handleOnChange = (e) =>{
    const { name ,value } = e.target
    setUser({...user,[name]: value})
    setError("")
  }

  const onLogin = () =>{

    if(user.userName === "" || user.password === ""){
      setError("Enter details")
    }else{
      setError("")
      axios.post("/login",user).then(
        (res)=>{
          console.log(res)
          if(res.data.loginStatus){
            dispatch(loginAction(user))
            
            localStorage.setItem('rememberMe', user.remember_me)

            dispatch( {type: 'SET_CAMERA', payload: res.data.camera_list } )
          }else{
            setError("Invalid credentials")
          }
        }
      ) .catch(function (error) {
        // handle error
        setError("Error Occured")
        console.log(error);
      })
      
    }
  }
  const [vantaEffect, setVantaEffect] = useState(0)
  const myRef = useRef(null)
  useEffect(()=>{
    console.log(localStorage.getItem('rememberMe'))
    if(localStorage.getItem('rememberMe') === 'true'){
      axios.post("/login",{
        userName : "admin",
        password : "admin@123",
      }).then(
        (res)=>{
          console.log(res)
          if(res.data.loginStatus){
            dispatch(loginAction(user))

            dispatch( {type: 'SET_CAMERA', payload: res.data.camera_list } )
          }else{
            setError("Invalid credentials")
          }
        }
      ) .catch(function (error) {

        setError("Error Occured")
        console.log(error);
      })
    }

    if (!vantaEffect) {
      setVantaEffect(NET({
        el: myRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        amplitudeFactor: 2.10,
        xOffset: 0.30,
        size: 1.80
      }))
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  },[vantaEffect])

  return (
    <div className="c-app c-default-layout flex-row align-items-center"
    // style={{
    //   background:`url("${bg}")`
    // }}
    ref={myRef}
    >

        <CRow className="ml-5">
          <CCol md="8">
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <CIcon name="cil-user" />
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput type="text" 
                      placeholder="Username" 
                      name= "userName" 
                      autoComplete="username" 
                      value = {user.userName}
                        onChange={handleOnChange}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <CIcon name="cil-lock-locked" />
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput type="password" 
                      placeholder="Password" 
                      autoComplete="current-password" 
                      name = "password"
                      value = {user.password}
                      onChange = {handleOnChange}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                    <CFormGroup variant="custom-checkbox" inline>
                      <CInputCheckbox 
                        custom 
                        id="inline-checkbox1" 
                        name="inline-checkbox1" 
                        checked ={user.remember_me}
                        onChange = {
                          (e)=>{
                              setUser({...user,remember_me: !user.remember_me})
                          }
                        }
                      />
                      <CLabel variant="custom-checkbox" htmlFor="inline-checkbox1">Remember me</CLabel>
                    </CFormGroup>
                    </CInputGroup>
                    <CRow>
                      <CCol xs="6">
                        <CButton 
                          color="primary" 
                          className="px-4"
                          onClick={onLogin}
                          >
                          Login
                          </CButton>
                      </CCol>
                      <CCol xs="6" className="text-right">
                        <span className="red">{error}</span>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-white py-5 d-md-down-none" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                  <img src={logo}/>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>

    </div>
  )
}

export default Login
