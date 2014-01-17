$(function(){

   $('form#catalogItem').on('click', '#addItem', function() {
       var data = {action: 'addCatalogItem'};
       data['category'] = $('form#catalogItem select[name="category"] option:selected').val();
       data['name'] = $('form#catalogItem input[name="modelName"]').val();
       data['description'] = $('form#catalogItem textarea[name="description"]').val();
       var colorAndImage = new Array();
       var image = null;
       
       /*console.log($('form#catalogItem input[name="colorId"]:checkbox:checked').length);
       return false;*/
       $.each($('form#catalogItem input:checkbox:checked'), function(){
           image = $(this).parent().find('select[name="imagePicker"]');
           colorAndImage[colorAndImage.length] = {'color': $(this).data('colorid'), 'image': $('option:selected', image).val()};
       });
       data['colorAndImage'] = colorAndImage;
       
       $( "#remove-confirm" ).dialog({
                title: "Добавляю / изменяю модель...",
		resizable: false,
		height:140,
		modal: true
        });       
       $.post(ajaxurl, data, function(response) {
           var responseText = response.response;
           $.get(ajaxurl, {action: 'returnCatalogList'}, function(response) {
               $( "#remove-confirm" ).text(responseText);
               $( "#remove-confirm" ).dialog( "option", "buttons", {"Ok": function() {
                       $(this).dialog("close");
                       $( "#remove-confirm" ).dialog( "destroy" );
                       $( "#remove-confirm" ).empty(); 
                   }
               });
               $( "#remove-confirm" ).text();
               $('ul#modelList').empty().html(response);
           }, 'html');
       }, 'json')
       return false;
   });
   
   $('form#catalogItem').on('click', '#cleanForm', function() {
       cleanForm();
       return false;
   });
   
   $('ul#modelList').on('click', 'input[name="removeModel"]', function(){
       var parentNode = $(this).parent();
       var data = {action: 'deleteCatalogItem', category: $(this).parent().data('category'), name: $(this).parent().data('name')};
       $( "#remove-confirm" ).text('Вы собираетесь удалить модель: '+ $(this).parent().data('name'));
       $( "#remove-confirm" ).dialog({
                title: "Удалить модель?",
		resizable: false,
		height:140,
		modal: true,
		buttons: {
                    "Удалить": function() {
                            $.post(ajaxurl, data, function(response) {
                               $(parentNode).remove();
                               cleanForm();
                           }, 'json');
                        $( this ).dialog( "close" );
                        $( "#remove-confirm" ).empty();
                        $( this ).dialog( "destroy" );
                    },
                    "Отмена": function() {
                        $( this ).dialog( "close" );
                        $( "#remove-confirm" ).empty();
                        $( this ).dialog( "destroy" );
                        $( "#remove-confirm" ).dialog( "destroy" );
                    }
                }
        });
   });
   
   $('img.pattern').css('opacity', '0.4');
   
   $('body').on('click', 'img.pattern', function() {
       var colorCheckbox = $(this).parent().find('input[name="colorId"]:checkbox');
       $(colorCheckbox).click();
       //$(this).toggleClass('activePattern');
   });
   
   $('form#catalogItem').on('change', 'input[name="colorId"]', function() {
       if($(this).is(':checked')) {
           $(this).parent().find('img.pattern').fadeTo('fast', 1.0);
           $('select[name="imagePicker"]:hidden').clone(true, true).appendTo($(this).parent().find('div.imageChoice')).show();
       }
       else {
           $(this).nextAll('div.imageChoice').find('select[name="imagePicker"]').remove();
           $(this).parent().find('img.pattern').fadeTo('fast', 0.4);
       }
       
       $('img#previewImg').attr('src', $('img#previewImg').data('imgurl') + '../../preview.jpg');
       $('div#imageName').text('');
   });
   
   $('form#catalogItem').on('change', 'select[name="category"]', function(){
      $('select[name="prefix"] option[value="'+$('select[name="category"] option:selected').val()+'"]').attr('selected', 'selected');
   });
   
   $('ul#modelList').on('click', 'li', function(e) {
       if( $(e.target).is('input')){return;}
       if($(this).hasClass('viewIt')) {
           return;
       }
       cleanForm();
       $(this).addClass('viewIt');
       var category = $(this).data('category');
       var name = ('0' + $(this).data('name').toString()).slice(-2);
       var description = $(this).data('description');
       $('select[name="category"] option[value=' + category + ']').attr('selected', true);
       $('select[name="category"]').change();
       $('input[name="modelName"]').val(name);
       $('textarea[name="description"]').val(description);
       var separator = '|#|';
       var colors = $(this).data('color').toString().split(separator);
       var images = $(this).data('image').toString().split(separator);
       for (var i = 0; i<colors.length; i++) {
           $('input[name="colorId"][data-colorid="' + colors[i] + '"]').click();
           $('input[name="colorId"][data-colorid="' + colors[i] + '"]').parent().find('select[name="imagePicker"] option[value="' + images[i] + '"]').attr('selected', true);
           //$('input[name="colorId"][data-colorid="' + colors[i] + '"]').parent().find('img.pattern').fadeTo('fast', 1.0);
       }
   });
  
  $('select[name="imagePicker"]').on('click', 'option', function() {
      if($(this).val() != -1) {
        if( !$('img#previewImg').attr('src').toString().match(''+$(this).val()+'') ) {
            $('div#imageName').text($(this).val());
            $('img#previewImg').attr('src', $('img#previewImg').data('imgurl') + $(this).val() + '?' + Math.random());
        }
      }
      else {
          $('img#previewImg').attr('src', $('img#previewImg').data('imgurl') + '../../preview.jpg');
          $('div#imageName').text('');
      }
  });
  
  $('body').on('click', '#automatedModel', function(){
      $( "#remove-confirm" ).dialog({
                title: "Добавляю модели...",
		resizable: false,
		height:140,
		modal: true
      });
      $.get(ajaxurl, {action: 'automatedModelProcess'}, function(response){
        var responseText = response.response;
          $.get(ajaxurl, {action: 'returnCatalogList'}, function(response) {
               $( "#remove-confirm" ).text(responseText);
               $( "#remove-confirm" ).dialog( "option", "buttons", {"Ok": function() {
                       $(this).dialog("close");
                       $( "#remove-confirm" ).dialog( "destroy" );
                       $( "#remove-confirm" ).empty(); 
                   }
               });
               $( "#remove-confirm" ).text();
               $('ul#modelList').empty().html(response);
           }, 'html');
      }, 'json');
  });
  
  $('body').on('click', '#truncateModel', function() {
      $( "#remove-confirm" ).dialog({
                title: "Удалить все модели?",
		resizable: false,
		height: 140,
		modal: true,
                buttons: {
                    "Удалить": function() {
                           $.get(ajaxurl, {action: 'emptyCatalogTable'}, function(response){
                                //$( "#remove-confirm" ).text(response.response);
                                cleanForm();
                                $('ul#modelList').empty()
                           }, 'json');
                        $( this ).dialog("close");
                        $( "#remove-confirm" ).empty();
                        $( this ).dialog( "destroy" );
                    },
                    "Отмена": function() {
                        $( this ).dialog("close");
                        $( "#remove-confirm" ).empty();
                        $( this ).dialog("destroy");
                        $( "#remove-confirm" ).dialog("destroy");
                    }
                }
      });
  });

  $('ul#modelList').on('click', 'input[name="isNew"]', function() {
      $(this).prop('checked', $(this).is(':checked'));
      var isNew = $(this).is(':checked');
      $( "#remove-confirm" ).dialog({
          title: "Пожалуйста подождите...",
          resizable: false,
          height:140,
          modal: true
      });
      $.post(ajaxurl, {action: 'setNewInCatalog', isNew: isNew, category: $(this).data('category'), name: $(this).data('name')}, function(response) {
          $( "#remove-confirm" ).text(response.response);
          $( "#remove-confirm" ).dialog( "option", "buttons", {"Ok": function() {
              $(this).dialog("close");
              $( "#remove-confirm" ).dialog( "destroy" );
              $( "#remove-confirm" ).empty();
          }
          });
      }, 'json');
  });

  $('body').on('click', '#update-db-table', function() {
      $.post(ajaxurl, {action: 'updateDbTable'}, function(response) {
          console.log(response);
      }, 'json');
  });
    
});

function cleanForm() {
   $('select[name="category"] option[value=' + -1 + ']').attr('selected', true);
   $('select[name="prefix"] option[value=' + -1 + ']').attr('selected', true);
   $('input[name="modelName"]').val('');
   $('textarea[name="description"]').val('');
   $('input[name="colorId"]:checked').click();
   $('ul#modelList li').removeClass('viewIt');
}