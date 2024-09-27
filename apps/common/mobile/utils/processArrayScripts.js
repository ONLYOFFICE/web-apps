export const processArrayScripts = async (array, fn) => {
	const results = [];

	for (const item of array) {
        try {
            const data = await fn(item);
            results.push(data);
        } catch (error) {
            console.log(`Error with processing element ${item}:`, error);
            continue;
        }
	}

	return results;
};