function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shortAddress(address: string) {
  return address.slice(0, 4) + "..." + address.slice(-4);
}

export {
  capitalize,
  shortAddress
}
