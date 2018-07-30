

module.exports = {

  isValidNumber(number) {
    console.log(number);
    return (number > 10);
  },

  isValidAddress(address) {
    return /^[a-z0-9]+[:.][a-z0-9]{0,4}[A-Za-z0-9\-._~:/?#[\]@!$&'()+,;=]*$/.test(address);
  },
};
