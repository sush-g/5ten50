(function($) {
  function register_events() {
    $('.js-create-room').on('click', (e) => {
      $.ajax({
        type: 'POST',
        url: '/create-room',
        data: JSON.stringify({}),
        success: (data) => {
          document.location.href = data.game_urlpath;
        },
        error: (resp) => {
          if (resp.status === 503) {
            if (resp.responseJSON && resp.responseJSON.message) {
              alert(resp.responseJSON.message);
            }
          }
        },
        contentType: "application/json",
        dataType: 'json'
      });
    });
  }

  $(document).ready(() => {
    register_events();
  })
})(jQuery);