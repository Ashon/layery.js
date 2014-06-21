'use strict';

// layery singleton
var layery = {};

// initialize
layery.init = function() {
  layery.targetDOM = $('*[layery]');

  if (!layery.targetDOM.length) {
    $('body').html('failed');
    return false;
  }

  $('body').addClass('layery');
  $('body').wrapInner($('<div>').attr('layery-stage', ''));

  layery.Stage = $('[layery-stage]');
  layery.Stage.prepend('<div>');

  layery.Glass = $('<div>').attr('layery-glass', '').addClass('hide');
  $('body').prepend(layery.Glass);

  // copy body dom to glass-bg : for blur effect

  layery.Glass.Background = $('<div>').attr('glass-bg', '');
  layery.Glass.Content = $('<div>').attr('glass-content', '');

  layery.Glass.append(layery.Glass.Background);
  layery.Glass.append(layery.Glass.Content);

  layery.Glass.Background.Content = layery.targetDOM.clone();
  layery.Glass.Background.html(layery.Glass.Background.Content);


  // event condition : transitionEnd
  var transitionEnd = 'transitionend webkitTransitionEnd';

  // module : blur effect
  (function blurModule(l) {
    if (l === undefined)
      return false;

    // event Handler : addHide
    var addHideClass = function(e) {
      e.data.element.addClass('hide');
    };

    // event Handler : rebind
    var rebind = function(a, b) {
      a.removeClass('hide');
      l.Glass.unbind();
      l.Glass.bind(transitionEnd, {
        element: b
      }, addHideClass);
      $(this).addClass('hide');
    };

    // register function : layery.toggleBlur()
    l.toggleBlur = function() {
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
  (function modalModule(l) {
    if (l === undefined)
      return false;

    // modal window DOM
    var modalWindow = $('<div>').addClass('modal-window');
    var modalHeader = $('<div>').addClass('modal-window-header');
    var modalTitle = $('<span>').addClass('modal-window-title');
    var modalWindowControl = $('<div>').addClass('modal-window-control');
    var modalWindowControlCloseBtn = $('<button>').addClass('modal-control-icon close').text('×');
    var modalBody = $('<div>').addClass('modal-window-body');

    // event handler : closeModal
    var closeModal = function(e) {
      var modalWindow = $(this).parents('.modal-window');

      modalWindow.bind(transitionEnd, function() {
        modalWindow.remove();
      });

      layery.toggleBlur();
      modalWindow.addClass('close');

      e.stopPropagation();
    }

    // register function : layery.modal(json)
    l.modal = function(json) {
      // generate modal DOM instance
      var windowInstance = modalWindow.clone();

      var closeBtnInstance = modalWindowControlCloseBtn.clone();
      closeBtnInstance.click(closeModal);

      var windowControlInstance = modalWindowControl.clone();
      windowControlInstance.append(closeBtnInstance);

      // titled window
      if (json.title) {
        var titleInstance = modalTitle.clone();
        titleInstance.text(json.title);

        var headerInstance = modalHeader.clone();
        headerInstance.append(windowControlInstance);
        headerInstance.append(titleInstance);

        windowInstance.append(headerInstance);
      } else {
        // untitled window
        windowInstance.append(windowControlInstance);
      }

      var bodyInstance = modalBody.clone();
      bodyInstance.html(json.content);

      windowInstance.append(bodyInstance);

      if (json.closeBtn) {
        var bodyCloseBtn = $('<button>').addClass('layery-btn close').text('close').click(closeModal);
        windowInstance.append(bodyCloseBtn);
      }

      // modal window size
      windowInstance.css({
        'width': json.width,
        'height': json.height,
      });

      // add modal instance to glass-content layer
      layery.Glass.Content.append(windowInstance);

      // toggle blur when modal on
      layery.toggleBlur();
    }
  })(layery);

}

// initialize onload
layery.initOnLoad = function() {
  $(layery.init);
}