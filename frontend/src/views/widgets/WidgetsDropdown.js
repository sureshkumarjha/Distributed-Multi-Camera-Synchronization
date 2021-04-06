import React from 'react'
import {
  CWidgetDropdown,
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CSwitch
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import ChartLineSimple from '../charts/ChartLineSimple'
import ChartBarSimple from '../charts/ChartBarSimple'
import { useSelector, useDispatch } from 'react-redux'


const WidgetsDropdown = (props) => {
  const cameraList = useSelector(state => state.cameraList)
  // render
  return (
    <CRow>
      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-primary"
          header={cameraList.length.toString()}
          text="Total Camera"
          style={{height: '150px'}}
          footerSlot={
            <ChartLineSimple
              pointed
              className="c-chart-wrapper mt-3 mx-3"
              style={{height: '70px'}}
              dataPoints={[cameraList.length]}
              pointHoverBackgroundColor="primary"
              label="camera"
              labels=""
            />
          }
        >
          {/* <CDropdown>
            <CDropdownToggle color="transparent">
              <CIcon name="cil-settings"/>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem>Action</CDropdownItem>
              <CDropdownItem>Another action</CDropdownItem>
              <CDropdownItem>Something else here...</CDropdownItem>
              <CDropdownItem disabled>Disabled action</CDropdownItem>
            </CDropdownMenu>
          </CDropdown> */}
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-info"
          header="2"
          text="Active Members"
          style={{height: '150px'}}
          footerSlot={
            <ChartLineSimple
              pointed
              className="mt-3 mx-3"
              style={{height: '70px'}}
              dataPoints={[1, 18, 9, 17, 34, 22, 11]}
              pointHoverBackgroundColor="info"
              options={{ elements: { line: { tension: 0.00001 }}}}
              label="Members"
              labels="months"
            />
          }
        >
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-warning"
          header="Smart Sense All"
          text="Activate Smart Sense for all cameras" 
          style={{height: '150px'}}
          footerSlot={
          <div style={{
            height: '70px',
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
            }}>

            <CSwitch className={'mx-3'} size={"lg"} variant={'3d'} color={'success'} 
                  />
          </div>
          }
        >
        </CWidgetDropdown>
      </CCol>

      <CCol sm="6" lg="3">
        <CWidgetDropdown
          color="gradient-danger"
          header="Monitoring Mode"
          text="Multiple Camera View"
          style={{height: '150px'}}
          footerSlot={
          <div style={{
            height: '70px',
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
            }}>

            <CSwitch className={'mx-3'} size={"lg"} variant={'3d'} color={'success'} 
                    checked = {props.monitoring} 
                    onChange = {props.onMonitorChange}
                  />
          </div>
          }
        >

        </CWidgetDropdown>
      </CCol>
    </CRow>
  )
}

export default WidgetsDropdown
