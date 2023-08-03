function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shortAddress(address: string, length=4) {
  return address.slice(0, length) + "..." + address.slice(-length);
}

export {
  capitalize,
  shortAddress
}
