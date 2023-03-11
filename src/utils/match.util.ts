//  Compare object with required fields
const obj = (
	object: any,
	requiredFields: string[]
): Array<string> | boolean => {
	let missingFields: Array<string> = [];

	requiredFields.forEach((element) => {
		if (!object[element]) {
			missingFields.push(element);
		}
	});

	if (missingFields.length > 0) {
		return missingFields;
	} else {
		return true;
	}
};

//  Validate an array's length
const arr = (array: any[], length: number[]) => {
	const [min, max] = length;

	if (array.length < min || array.length > max) {
		return false;
	} else {
		return true;
	}
};

const match = {
	obj,
	arr,
};

export default match;
