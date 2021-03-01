const loginAction = (userobj) => {
	return {
		type:"LOG_IN",
		payload: userobj
	}
}
const logoutAction = () => {
	return {
		type:"LOG_OUT"
	}
}
export {
	loginAction,
	logoutAction
}