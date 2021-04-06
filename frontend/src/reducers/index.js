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
		case "REMOVE_CAMERA":
			state.splice(action.payload.camera_index,1)
			return [...state]
		case "UPDATE_CAMERA":
			state[action.payload.camera_index] = action.payload
			return [...state]
		case "SET_CAMERA":
			return [...action.payload]
		default:
			return state
	}
}

const system_monitoring = (state = { "cpu": 0, "memory": 0, "processingFPS": [] , "streamingFPS":[] }, action) => {
	switch(action.type){
		case "SET":
			return {...action.payload }
		default:
			return state
	}
}

const user_data = (state = { }, action) => {
	switch(action.type){
		case "SET_DATA":
			return {...action.payload }
		default:
			return state
	}
}

export default combineReducers({
  sidebarShow,
  currentUser,
  cameraList,
  system_monitoring,
  user_data
})
