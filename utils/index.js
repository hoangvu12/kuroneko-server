String.prototype.replaceArray = function (arr, toBe) {
  let string = this;

  arr.forEach((text) => {
    string = string.replace(text, toBe);
  });

  return string;
};

Number.prototype.round = function () {
  const number = this;

  if (number / Math.floor(number) !== 1) {
    return toFixed(number + 1);
  }

  return toFixed(number);
};

const toFixed = (number) => Number(number.toString().split(".")[0]);

const serialize = function (obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

function isValidUrl(str) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

module.exports = {
  toFixed,
  serialize,
  isValidUrl,
};
