import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CPagination
} from '@coreui/react'

import usersData from './UsersData'
import empty from '../../assets/images/empty.png'

const getBadge = status => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Pending': return 'warning'
    case 'Banned': return 'danger'
    default: return 'primary'
  }
}

const Users = () => {
  const history = useHistory()
  const queryPage = useLocation().search.match(/page=([0-9]+)/, '')
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1)
  const [page, setPage] = useState(currentPage)

  const pageChange = newPage => {
    currentPage !== newPage && history.push(`/users?page=${newPage}`)
  }
  const user_data = useSelector(state => state.user_data)

  useEffect(() => {
    currentPage !== page && setPage(currentPage)
  }, [currentPage, page])
  console.log("People ",user_data)
  return (
    <div className="flex-row">
    <CRow className="justify-content-center">
    {
      (Object.keys(user_data).length == 0)?
      <div className="text-center"
      style={{
        width:"100%"
      }}
      >
      <img 
        src = {empty}
        style={{
          height:"20em",
          width:"20em",
          borderRadius:"100%",
          objectFit:"cover",    
          boxShadow: "-4px 0px 0px 0px #b9b9b9",
        }}
      />
      <div className="pa3">
      No Cameras Added
      </div>
      </div>
      :
      <>  
      </>
    }
    {
      Object.keys(user_data).map((camera_name,idx)=>{
        return <CCol xl={12}>
        <CCard>
          <CCardHeader>
            {camera_name}
          </CCardHeader>
          <CCardBody 
          style={{
            display:"flex",
            flexWrap:"wrap"
          }}
          >
          {
            Object.keys(user_data[camera_name]).map((people_id,idx)=>{
              return <div
              className="pa3"
              >
              <img 
                height = {"250px"}
                src = {user_data[camera_name][people_id]}
              />
              <div  className="pa2" >
              {people_id}
              </div>
              </div>
            })
          }
          </CCardBody>
        </CCard>
      </CCol>
      }
      )
    }
      
  
    </CRow>
    </div>
  )
}

export default Users

{/* <CDataTable
            items={usersData}
            fields={[
              { key: 'name', _classes: 'font-weight-bold' },
              'registered', 'role', 'status'
            ]}
            hover
            striped
            itemsPerPage={5}
            activePage={page}
            clickableRows
            onRowClick={(item) => history.push(`/users/${item.id}`)}
            scopedSlots = {{
              'status':
                (item)=>(
                  <td>
                    <CBadge color={getBadge(item.status)}>
                      {item.status}
                    </CBadge>
                  </td>
                )
            }}
          />
          <CPagination
            activePage={page}
            onActivePageChange={pageChange}
            pages={5}
            doubleArrows={false} 
            align="center"
          /> */}