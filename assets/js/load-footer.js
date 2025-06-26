document.addEventListener('DOMContentLoaded', function() {
  let footerPath = '/components/footer.html';

  fetch(footerPath)
    .then(response => {
      if (!response.ok) {
        throw new Error('Não foi possível carregar o footer: ' + response.statusText);
      }
      return response.text();
    })
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => {
      console.error(error);
    });
});
