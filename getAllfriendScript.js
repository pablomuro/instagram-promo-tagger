let ulClass = 'jSC57'
let friendsUl = document.querySelector(`ul.${ulClass}`)
let friends = friendsUl.querySelectorAll('li')
let friendsToJsonArray = []

friends.forEach((el) => {
  const targetDiv = el.querySelector('div:nth-child(2)')
  const profile = targetDiv.querySelector('a').text
  const name = targetDiv.querySelector('div:nth-of-type(2)').textContent
  let seguir = targetDiv.querySelector('button')
  seguir = Boolean(seguir)
  if (seguir) {
    friendsToJsonArray.push({ profile, name, seguir })
  } else {
    friendsToJsonArray.push({ profile, name })
  }
})

friendsToJsonArray.sort((a, b) => {
  if (a.seguir) return -1
  if (b.seguir) return 1

  return 0
})


let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(friendsToJsonArray));
let dlAnchorElem = document.createElement('a');
dlAnchorElem.setAttribute("href", dataStr);
dlAnchorElem.setAttribute("download", "AllFriends.json");
dlAnchorElem.click();




