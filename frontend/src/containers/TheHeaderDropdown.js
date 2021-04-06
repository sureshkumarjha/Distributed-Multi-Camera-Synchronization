import React from 'react'
import {
  CBadge,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CImg,
  CLink
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useSelector, useDispatch} from 'react-redux'
import {logoutAction} from '../actions'

const TheHeaderDropdown = () => {
  const dispatch = useDispatch()
  const onLogOut = () =>{
    dispatch(logoutAction())
    localStorage.setItem('rememberMe', false)
  }

  return (
    <CDropdown
      inNav
      className="c-header-nav-items mx-2"
      direction="down"
    >
      <CDropdownToggle className="c-header-nav-link" caret={false}>
        <div className="c-avatar">
          <CImg
            src={'avatars/logo.png'}
            className="c-avatar-img"
            alt="admin@bootstrapmaster.com"
          />
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem
          header
          tag="div"
          color="light"
          className="text-center"
        >
          <strong>Settings</strong>
        </CDropdownItem>
        <CDropdownItem>
          <CIcon name="cil-user" className="mfe-2" />Profile
        </CDropdownItem>
        <CDropdownItem>
        <CLink 
          className="c-subheader-nav-link" 
          aria-current="page" 
          to="/settings"
        >
          <CIcon name="cil-settings" className="mfe-2" />
          Settings
        </CLink>
        </CDropdownItem>
        <CDropdownItem divider />
        <CDropdownItem
        onClick = {onLogOut}
        style={{
          color:"red"
        }}
        >
          <CIcon name="cil-lock-locked" className="mfe-2" />
          Log Out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default TheHeaderDropdown
