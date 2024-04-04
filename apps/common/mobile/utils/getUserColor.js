export const getUserColor = (id, intValue) => {
	const api = Common.EditorApi.get();
	const color = api.asc_getUserColorById(id);
	const userColors = ["#" + ("000000" + color.toString(16)).slice(-6), color];

	return intValue ? userColors[1] : userColors[0];
}