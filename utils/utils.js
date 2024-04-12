function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function cityValidator(str) {
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);

        if (
            !(charCode >= 65 && charCode <= 90) &&
            !(charCode >= 97 && charCode <= 122) &&
            !(charCode === 45)
        ) {
            return false;
        }
    }
    return true;
}

module.exports = { capitalizeFirstLetter, cityValidator };