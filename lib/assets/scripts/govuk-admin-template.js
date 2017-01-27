//= require jquery
//= require jquery_ujs
//= require bootstrap
//= require govuk-admin-template/govuk-admin
//= require_tree ./govuk-admin-template/modules

// Find and auto-start modules specified using the data-module="" pattern in markup
(function($, GOVUKAdmin) {
  $(function(){
    GOVUKAdmin.startAll();
  });

  $(window.document).on('click', 'a[data-toggle="modal-remote"]', function(evt) {
    evt.preventDefault();

    var $target = $($(this).data('target'));
    var $modal = $target.modal();
    var href = $(this).attr('href');
    var hash = '#' + href.split('#')[1]
    $modal.find('.modal-body').load(href, function (responseText, textStatus) {
      if ( textStatus !== 'success' && textStatus !== 'notmodified') return;

      var $dom = $(responseText);
      $modal.find('.modal-title').empty().append($dom.find('h1'));
      $modal.find('.modal-body').empty().append($dom.find(hash));
      $modal.show();
    });
  });
})(jQuery, window.GOVUKAdmin);
