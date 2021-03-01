import { combineReducers } from 'redux'

const currentUser = (state = {user: {}, isLogin : false},action) => {
	switch(action.type){
		case "LOG_IN":
			return {
				...state,
				user : action.payload,
				isLogin : true
			}
		case "LOG_OUT":
			return {
				...state,
				user: {},
				isLogin : false
			}
		default:
			return state
	}
}


const sidebarShow = (state = 'responsive', { type, ...payload }) => {
  switch (type) {
    case 'set':
      return payload.sidebarShow
    default:
      return state
  }
}

export default combineReducers({
  sidebarShow,
  currentUser
})
