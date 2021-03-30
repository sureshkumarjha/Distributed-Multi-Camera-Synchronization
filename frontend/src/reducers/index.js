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

const cameraList = (state = [], action ) => {
	switch(action.type){
		case "ADD_CAMERA":
			state.push(action.payload)
			return [...state]
		case "DELETE_CAMERA":
			return state
		case "UPDATE_CAMERA":
			state[action.payload.camera_index] = action.payload
			return [...state]
		default:
			return state
	}
}

export default combineReducers({
  sidebarShow,
  currentUser,
  cameraList
})
