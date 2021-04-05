import React, { useState, useEffect, Suspense } from 'react';
import {
  Redirect,
  Route,
  Switch
} from 'react-router-dom'
import { CContainer, CFade } from '@coreui/react'
import socketIOClient from "socket.io-client";
import { useSelector, useDispatch } from 'react-redux'
// routes config
import routes from '../routes'

const ENDPOINT = "http://localhost:5000/surveillance";
  
const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

const TheContent = () => {
  const dispatch = useDispatch();
  const socket = socketIOClient(ENDPOINT);
  console.log(socket);

  useEffect(() => {
    
    socket.on("system_data", data => {
      console.log(data)
    });

    socket.on("system_monitoring", data => {
      // console.log("Socket data",data,JSON.parse(data))
      dispatch({type : "SET", payload: JSON.parse(data) })
    });

    return function cleanup() {
      socket.disconnect()
      console.log("Disconect ")
    };
  },[])
  return (
    <main className="c-main">
      <CContainer fluid>
        <Suspense fallback={loading}>
          <Switch>
            {routes.map((route, idx) => {
              return route.component && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  render={props => (
                    <CFade>
                      <route.component {...props} />
                    </CFade>
                  )} />
              )
            })}
            <Redirect from="/" to="/dashboard" />
          </Switch>
        </Suspense>
      </CContainer>
    </main>
  )
}

export default React.memo(TheContent)
