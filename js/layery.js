'use strict';

// layery singleton
var layery = {};

layery.init = function() {
  layery.targetDOM = $('*[layery]');

  if (!layery.targetDOM.length) {
    $('body').html('failed');
    return false;
  }

  $('body').addClass('layery');
  $('body').wrapInner('<div id="layery-stage"></div>');
  $('body').prepend('<div id="layery-glass" class="hide"></div>');
  $('#layery-stage').prepend('<div>');

  layery.Glass = $('#layery-glass');
  layery.Stage = $('#layery-stage');

  // copy body dom to glass-bg : for blur effect
  layery.Glass.append('<div id="glass-bg"></div><div id="glass-content"></div>');
  layery.Glass.Background = layery.Glass.find('#glass-bg');
  layery.Glass.Content = layery.Glass.find('#glass-content');

  layery.Glass.Background.html(layery.targetDOM.clone());

  // module : blur effect
  (function blur(l) {
    if (l === undefined)
      return;

    var handler = function(e) {
      e.data.element.addClass('hide');
    };

    var rebind = function(a, b) {
      a.removeClass('hide');
      l.Glass.unbind('transitionend webkitTransitionEnd');
      l.Glass.bind('transitionend webkitTransitionEnd', {
        element: b
      }, handler);
      $(this).addClass('hide');
    };

    // register function
    l.toggleBlur = function(content) {
      l.Glass.Background.css({
        'top': l.Stage.find('*:first-child').offset().top,
        'left': l.Stage.find('*:first-child').offset().left
      });
      if (!$('body').hasClass('blur')) {
        rebind(l.Glass, l.Stage);
      } else {
        rebind(l.Stage, l.Glass);
      }
      $('body').toggleClass('blur');
    }
  })(layery);

  // module : modal window
  (function modal(l) {
    if (l === undefined)
      return;

    // close event 
    var closeModal = function(e) {
      var that = $(this);
      layery.toggleBlur();
      that.parents('.modal-window').bind('transitionend webkitTransitionEnd', function() {
        that.parents('.modal-window').remove();
      });
      that.parents('.modal-window').addClass('close');
      e.stopPropagation();
    }

    var modalWindow = $('<div class="modal-window">');
    var modalHeader = $('<div class="modal-window-header">');
    var modalTitle = $('<span class="modal-window-title">');
    var modalWindowControl = $('<div class="modal-window-control">')
    var modalWindowControlCloseBtn = $('<button class="modal-control-icon close">×</button>');
    var modalBody = $('<div class="modal-window-body">');

    // register function
    l.modal = function(json) {
      var windowInstance = modalWindow.clone();
      windowInstance.css({
        'width': json.width,
        'height': json.height,
      });

      var closeBtnInstance = modalWindowControlCloseBtn.clone();
      closeBtnInstance.click(closeModal);

      var windowControlInstance = modalWindowControl.clone();
      windowControlInstance.append(closeBtnInstance);

      if (json.title) {

        var titleInstance = modalTitle.clone();
        titleInstance.text(json.title);

        var headerInstance = modalHeader.clone();
        headerInstance.append(windowControlInstance);
        headerInstance.append(titleInstance);

        windowInstance.append(headerInstance);
      } else {
        windowInstance.append(windowControlInstance);
      }

      var bodyInstance = modalBody.clone();
      bodyInstance.html(json.content);

      windowInstance.append(bodyInstance);

      if (json.closeBtn == true) {
        windowInstance.append('<button class="layery-btn close">Close</button>')
        windowInstance.find('.layery-btn.close').click(closeModal);
      }

      layery.Glass.Content.append(windowInstance);
      layery.toggleBlur();
    }
  })(layery);

}

layery.initOnLoad = function() {
  $(layery.init);
}