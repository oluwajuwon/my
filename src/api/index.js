
export const getMediumPosts = () => {
  const url = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40jfagbohungbe';
  return new Promise((resolve, reject) => {

    fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      }
    })
    .then(response => {
      if ([200, 201].includes(response.status)) {
        response.json()
          .then(res => {
            return resolve(res)
          });
      }
    })
    .catch((error) => {
      reject(error)
    })
  });
}