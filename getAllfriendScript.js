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

// ================== another script 


let username = 'pablo_muro'
let followers = [], followings = []
try {
  let res = await fetch(`https://www.instagram.com/${username}/?__a=1`)

  res = await res.json()
  let userId = res.graphql.user.id

  let after = null, has_next = true
  while (has_next) {
    await fetch(`https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=` + encodeURIComponent(JSON.stringify({
      id: userId,
      include_reel: true,
      fetch_mutual: true,
      first: 50,
      after: after
    }))).then(res => res.json()).then(res => {
      has_next = res.data.user.edge_followed_by.page_info.has_next_page
      after = res.data.user.edge_followed_by.page_info.end_cursor
      followers = followers.concat(res.data.user.edge_followed_by.edges.map(({ node }) => {
        return {
          username: node.username,
          full_name: node.full_name
        }
      }))
    })
  }
  console.log('Followers', followers)
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(followers));
  let dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "AllFriendsSimpleList.json");
  dlAnchorElem.click();

  has_next = true
  after = null
  while (has_next) {
    await fetch(`https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` + encodeURIComponent(JSON.stringify({
      id: userId,
      include_reel: true,
      fetch_mutual: true,
      first: 50,
      after: after
    }))).then(res => res.json()).then(res => {
      has_next = res.data.user.edge_follow.page_info.has_next_page
      after = res.data.user.edge_follow.page_info.end_cursor
      followings = followings.concat(res.data.user.edge_follow.edges.map(({ node }) => {
        return {
          username: node.username,
          full_name: node.full_name
        }
      }))
    })
  }
  console.log('Followings', followings)
} catch (err) {
  console.log('Invalid username')
}