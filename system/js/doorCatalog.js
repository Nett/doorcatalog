jQuery.noConflict();
var patterns = null;
var likedModels = new Object();
(function($) {
$(function() {

	if(!$.curCSS) {
		$.curCSS = $.css;
	}

    getSettedUpCookie('favoriteDoors');
    getSettedUpCookie('chosenWall');
    getSettedUpCookie('chosenFloor');
    if($.browser.safari || $.browser.webkit) {
        $('#roomImgHolder').css({'height': '223px'});
    }

    $('img.modelPicture, img.likedModelPicture').bind('contextmenu', function(e){
        return false;
    });

    $('img.currentViewImg').bind('contextmenu', function(e){
        return false;
    });

    $('img.modelPictureCategoryViewer').bind('contextmenu', function(e){
        return false;
    });


    if($('#patternHolder').length) {
        patterns = $('#patternHolder').clone(false);
        $('img',patterns).removeClass('activePattern').addClass('colorPattern');
        var currentColorIndex = $('#colorsMatch li:has(img.activePattern)').index();
        jQuery('#colorsMatch').bxSlider({
            displaySlideQty: $('div#patternHolder').data('colorcount'),
            moveSlideQty: $('div#patternHolder').data('colorcount')
        }).goToSlide(currentColorIndex, true);
    }

    $('ul#colorsMatch').on('click', 'li', function() {
        $('ul#colorsMatch li img').removeClass('activePattern').addClass('colorPattern');
        $('img', this).removeClass('colorPattern').addClass('activePattern');
        $('span.currentPattern').text($('ul#colorsMatch img.activePattern').attr('title'));
            $('ul#catalogItemList li').fadeOut(500);
            queryModels();
    });

    /*$('body').on('change', 'select#catalogCategories', function() {
        $('ul#catalogItemList li').fadeOut(500);
        window.location = $(this).find('option:selected').data('categoryurl') + '&color=' + $('#colorsMatch li:has(img.activePattern)').data('colorid');
        //queryModels();
    });*/
    $('body').on('click', 'a.catalogItemListMenuLink', function(e) {
        e.preventDefault();
        $('ul#catalogItemList li').fadeOut(500);
        window.location = $(this).data('categoryurl') + '&color=' + $('#colorsMatch li:has(img.activePattern)').data('colorid');
    });

    //$('ul#dialogPattern')

    function setArtCategoryImgPositionSize(leafAppearanceType, roomOrZoom) {
        // 1 - Zoom // 0 - Room
        if(roomOrZoom){
            if(leafAppearanceType == 'b') {
                $('img.currentViewArtImg').css({'top': '122px', 'left': '70px', 'width': '135px', 'height': '401px'});
                $('.leafAppearanceNoB').removeClass('defAppearance');
                $('.leafAppearanceB').addClass('defAppearance');
            }
            else {
                $('img.currentViewArtImg').css({'top': '96px', 'left': '44px', 'width': '187px', 'height': '465px'});
                $('.leafAppearanceB').removeClass('defAppearance');
                $('.leafAppearanceNoB').addClass('defAppearance');
            }
        }
        else {
            if(leafAppearanceType == 'b') {
                $('img.currentViewArtImg').css({'top': '22px', 'left': '21px', 'width': '62px', 'height': '183px'});
                $('.leafAppearanceNoB').removeClass('defAppearance');
                $('.leafAppearanceB').addClass('defAppearance');
            }
            else {
                $('img.currentViewArtImg').css({'top': '10px', 'left': '9px', 'width': '85px', 'height': '212px'});
                $('.leafAppearanceB').removeClass('defAppearance');
                $('.leafAppearanceNoB').addClass('defAppearance');
            }
        }
    }

    $('ul#catalogItemList').on('click', 'span.zoomModel, img.likedModelPicture', function() { //img.modelPicture
    var currentActonElement = ($(this).hasClass('zoomModel')) ? $(this).parent().prevAll('img.modelPicture') : $(this) ;
    var imgSrc = $(currentActonElement).attr('src');
    var modelName = $(currentActonElement).data('modelname');
    var modelPrefix = $(currentActonElement).data('modelprefix');
    var categoryId = $(currentActonElement).data('categoryid');
    var isModelPicture = $(currentActonElement).hasClass('modelPicture');
    var isPictureInArtMode = $('.artSamples').find('img[data-modelname="' + ('0' + modelName.toString()).slice(-2) + '"]').length;
        if((categoryId == 6 && $('.artSamples').length && isPictureInArtMode) || (categoryId == 7 && $('.artSamples').length && isPictureInArtMode) ) {
            var modelPicture = $(currentActonElement).next('img.modelPictureImage').attr('src');
        }
        $('div#catalogDialogBox').empty();
        $('div#catalogDialogBox').dialog({
                title: "Просмотр модели",
		resizable: false,
		height:815,
        width: 800,
		modal: true,
                open: function(e, ui) {
                    if(isModelPicture) {
                        var dialogPatterns = $(patterns).clone(false);
                        $(dialogPatterns).on('click', 'li', function() {
                            $('ul#dialogPattern li img').removeClass('activePattern').addClass('colorPattern');
                            $('img', this).removeClass('colorPattern').addClass('activePattern');
                            //if(($('select#catalogCategories option:selected').val() != 6) && ($('select#catalogCategories option:selected').val() != 7) ) {
                            if(($('.activeMenuCategory').data('categoryid') != 6) && ($('.activeMenuCategory').data('categoryid') != 7) ) {
                                $('div#catalogDialogBox div#imgHold').fadeOut(500);
                                queryColor();
                            }
                            else {
                                //$('ul#catalogItemList li').fadeOut(100);
                                var colorId = $(this).data('colorid');
                                //$('#imgHold img.leafAppearance')
                                var src = $('#imgHold img.currentViewImg').attr('src');
                                var patternCategory = '6'; // !!! important DEFAULT value for patterns category //$('select#catalogCategories option:selected').val()
                                src = src.replace(/\/6-[0-9]{1,3}/gi, '/'+patternCategory+'-'+colorId);
                                $('#imgHold img.currentViewImg').prop('src', src);
                                $('div#catalogDialogBox div.currentPatternName span.currentPattern').text($('ul#dialogPattern li img.activePattern').attr('title'));
                                //$('ul#catalogItemList li').fadeIn(1500);
                            }
                        });
                        if((categoryId != 6) && (categoryId != 7)) {
                            $('div#catalogDialogBox').append($('<div>').addClass('currentPatternName'));
                            $('div#catalogDialogBox div.currentPatternName').append($('<span>').text('Текущий цвет: '));
                            $('div#catalogDialogBox div.currentPatternName').append($('<span>').addClass('currentPattern'));
                            $('div#catalogDialogBox div.currentPatternName span.currentPattern').text($('img.activePattern').attr('title'));
                        }
                        $('div#catalogDialogBox').append($('<div>').attr('id','zoomSamplesHolder').css('overflow','hidden'));

                        $('div#catalogDialogBox #zoomSamplesHolder').append(dialogPatterns);
                        $('div#catalogDialogBox #zoomSamplesHolder #patternHolder').css('width', '435px');
                        $('div#catalogDialogBox #zoomSamplesHolder #patternHolder ul#colorsMatch').attr('id', 'dialogPattern');
                        var dialogIndexColor = null;
                        if( $('#colorsMatch li:not(.pager):has(img.activePattern)').length ) {
                            dialogIndexColor = $('#colorsMatch li:not(.pager):has(img.activePattern)').data('colorindex');
                        }
                        else {
                            dialogIndexColor = $('#colorsMatch li.pager:has(img.activePattern)').data('colorindex');
                        }
                        var slideQty = $('div#patternHolder').data('colorcount');
                        var slideMove = $('div#patternHolder').data('colorcount');
                        if((categoryId == 6 && $('.artSamples').length && isPictureInArtMode) || (categoryId == 7 && $('.artSamples').length && isPictureInArtMode) ) {
                            slideQty = 4; slideMove = 4;
                            $('div#catalogDialogBox #zoomSamplesHolder #patternHolder').css({height: '110px', float: 'left', overflow: 'hidden', 'width': '300px', 'display': 'inline-block', 'padding-left': '55px'});
                            $('div#catalogDialogBox #zoomSamplesHolder #patternHolder').prepend($('<div>').addClass('currentPatternName'));
                            $('div#catalogDialogBox #zoomSamplesHolder #patternHolder div.currentPatternName').append($('<span>').text('Текущий цвет: '));
                            $('div#catalogDialogBox #zoomSamplesHolder #patternHolder div.currentPatternName').append($('<span>').addClass('currentPattern'));
                            $('div#catalogDialogBox #zoomSamplesHolder #patternHolder div.currentPatternName span.currentPattern').text($('img.activePattern').attr('title'));
                        }
                        var dialogSlider = $('div#catalogDialogBox ul#dialogPattern').bxSlider({
                            displaySlideQty: slideQty,
                            moveSlideQty: slideMove
                        });
                        dialogSlider.goToSlide(dialogIndexColor, false);
                        var dialogActivePattern = $('div#catalogDialogBox ul#dialogPattern li.pager').get(dialogSlider.getCurrentSlide());
                        $('img.colorPattern', dialogActivePattern).removeClass('colorPattern').addClass('activePattern');
                    }
                    else {
                        $('div#catalogDialogBox').dialog({height:710});
                    }


                    $('div#catalogDialogBox').append($('<div>').attr('id', 'imgHold').css({'position': 'relative', 'float': 'left','width': '275px', 'margin': '5px 0 0 55px', 'text-align': 'center', 'padding-top': '3px'}));
                    $('div#catalogDialogBox').append($('<div>').attr('id', 'infoHold').css({'overflow': 'hidden', 'padding': '35px 0 5px 10px'}));
                    // ART category section
                    var sourcePattern = /\/art\/border\//;
		            if((categoryId == 6 && $('.artSamples').length && isPictureInArtMode) || (categoryId == 7 && $('.artSamples').length && isPictureInArtMode)) { // Hardcoded for Art category
                        $('div#catalogDialogBox #zoomSamplesHolder').append($('<div>').attr({'id': 'artSamplesHolder'}).css({'width': '230px', 'margin': '0px auto 0 50px', 'display': 'inline-block'}));
                        $('div#catalogDialogBox #zoomSamplesHolder #artSamplesHolder').append($('<div class="currentPatternName">Другие фото из каталога:</div>'));
                        $('div#catalogDialogBox #zoomSamplesHolder #artSamplesHolder').append($('.artSamples').clone(false));
                        $('div#catalogDialogBox #zoomSamplesHolder #artSamplesHolder img.pictureArt').css({'width': '43px', 'height': '75px'});
                        $('div#catalogDialogBox #zoomSamplesHolder .artSamples').css({'height': '92px', 'display': 'block'});
                        $('div#catalogDialogBox #zoomSamplesHolder .artSamples li').css({'width': '55px', 'height': '92px'});
                        var bsSliderNumberSlides = $('div#catalogDialogBox #zoomSamplesHolder .artSamples').data('picturecount');
                        var dialogArtSamples = $('div#catalogDialogBox #zoomSamplesHolder .artSamples').bxSlider({
                            displaySlideQty: 4,
                            moveSlideQty: 3
                        });

                        if(categoryId == 7) {
                            $('#artSamplesHolder').css('margin-left','135px');
                        }

                        if(categoryId == 6) {
                            $('<div id="leafAppearanceChoice" style="display: inline-block; width: 85px; text-align: center; float: left; overflow: hidden;" class="currentPatternName">Вид полотна:' +
                                '<img class="leafAppearanceNoB" src="' + $('div#catalogDialogBox .artSamples').data('pluginurl') + '/images/sample/door/noBorder.png' + '" width="35px" height="70px" style="cursor: pointer;" />' +
                                '<img class="leafAppearanceB" src="' + $('div#catalogDialogBox .artSamples').data('pluginurl') + '/images/sample/door/border.png' + '" width="35px" height="70px" style="cursor: pointer; margin-left:5px;" />' +
                                '</div>').insertBefore('div#catalogDialogBox #zoomSamplesHolder #artSamplesHolder');
                            if(sourcePattern.test(imgSrc.toString())) {
                                $('div#catalogDialogBox img.leafAppearanceB').addClass('defAppearance');
                            }
                            else {
                                $('div#catalogDialogBox img.leafAppearanceNoB').addClass('defAppearance');
                            }
                        }

                    }
                    $('div#catalogDialogBox div#infoHold').append($('<div>').css({'border-bottom': '3px solid #DE5328', 'font-size': '13px', 'padding-bottom': '5px'}).text($('span.modelDescription').text()));
                    var buy_information = '<div id="buy_informayion" style="font-size:13px;">Уважаемый клиент, для того чтобы заказать понравившуюся модель вы можете позвонить нам по номерам телефонов<br>(057) 757-3-2-1-0 ;<br>(093) 452-50-84 ;<br>(067) 539-50-70<br> Или оставить заявку на странице <a href="http://dorum.com.ua/contact/" target="_blank">http://dorum.com.ua/contact/</a> и мы с радостью с Вами свяжемся!</div>';
		    $('div#catalogDialogBox div#infoHold').append(buy_information);
		    $('div#catalogDialogBox div#infoHold').append($('a.priceLink').clone(true, true).css('display','block')).append($('a.constructionLink').clone(false, false).css('display','block'));

		    $('div#catalogDialogBox div#imgHold').append($('<div>').addClass('modelTitle'));
                    $('div#catalogDialogBox div#imgHold div.modelTitle').append($('<p>').css({'margin': '4px 0px', 'font-size': '18px', 'padding-left': '10px', 'text-align': 'left'}).text(modelPrefix.toString().slice(0,1).toUpperCase() + modelPrefix.toString().slice(1) +'-'+ ('0' + modelName.toString()).slice(-2)) );
                    // !!! ART category section !!!
                    if((categoryId == 6 && $('.artSamples').length && isPictureInArtMode) || (categoryId == 7 && $('.artSamples').length && isPictureInArtMode) ) {
                        $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': imgSrc.toString() + '?' + Math.random(), 'width': '275px', 'height': '550px', 'alt': ''}).addClass('currentViewImg leafAppearance').data({'modelname': modelName, 'categoryid': categoryId}));
                        var handleImage = 'handle';
                        var handleImageLeft = '55px';
                        if(categoryId == 7) {
                            handleImage = 'handleG';
                            handleImageLeft = '47px';
                            $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': $('div#catalogDialogBox .artSamples').data('pluginurl') + '/images/sample/door/hinge.png' + '?' + Math.random(), 'width': '30px', 'height': '21px', 'alt': ''}).css({'position': 'absolute', 'top': '145px', 'left': '213px', 'z-index': '10'}));
                            $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': $('div#catalogDialogBox .artSamples').data('pluginurl') + '/images/sample/door/hinge.png' + '?' + Math.random(), 'width': '30px', 'height': '21px', 'alt': ''}).css({'position': 'absolute', 'top': '467px', 'left': '213px', 'z-index': '10'}));
                        }
                        $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': $('div#catalogDialogBox .artSamples').data('pluginurl') + '/images/sample/door/'+handleImage+'.png' + '?' + Math.random(), 'width': '32px', 'height': '12px', 'alt': ''}).css({'position': 'absolute', 'top': '321px', 'left': handleImageLeft, 'z-index': '10'}));
                        if(!sourcePattern.test(imgSrc.toString())) {
                            $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': modelPicture + '?' + Math.random(), 'alt': ''}).addClass('currentViewArtImg').css({'position': 'absolute', 'top': '96px', 'left': '44px', 'width': '187px', 'height': '465px', 'z-index': '-1'}));
                        }
                        else {
                            $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': modelPicture + '?' + Math.random(), 'alt': ''}).addClass('currentViewArtImg').css({'position': 'absolute', 'top': '122px', 'left': '70px', 'width': '135px', 'height': '401px', 'z-index': '-1'}));
                        }
                        $('div#catalogDialogBox').on('click', '.artSamples li',function() {
                            if(!$('div#catalogDialogBox div#imgHold img.currentViewArtImg').length) {
                                $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': $('img', this).attr('src') + '?' + Math.random(), 'width': '186px', 'height': '465px', 'alt': ''}).addClass('currentViewArtImg').css({'position': 'absolute', 'top': '96px', 'left': '45px', 'z-index': '9'}));
                            }
                            else {
                                $('div#catalogDialogBox div#imgHold img.currentViewArtImg').attr({'src': $('img', this).attr('src') + '?' + Math.random()});
                            }
                            $('div#catalogDialogBox .modelTitle p').text($('img', this).data('modelprefix') + '-' + ('0' + $('img', this).data('modelname').toString()).slice(-2) );
                        });
                    }
                    else if( (categoryId == 6 && currentActonElement.hasClass('likedModelPicture')) || (categoryId == 7 && currentActonElement.hasClass('likedModelPicture')) ){
                        setupFolderModel(currentActonElement, imgSrc, sourcePattern, modelName, categoryId);
                    }
                    else {
                        $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': imgSrc.toString().replace('small','original')+ '?' + Math.random(), 'width': '275px', 'height': '550px', 'alt': ''}).addClass('currentViewImg').data({'modelname': modelName, 'categoryid': categoryId}));
                    }


		    $('img.currentViewImg').bind('contextmenu', function(e){
                        return false;
                    });
                },
            close: function() {
                $('div#catalogDialogBox').empty(); $(this).dialog('destroy');
            },
                buttons: {
                    "Закрыть": function() {$(this).dialog('close');}
                }
        });
    });

    $('#catalogDialogBox, #room-window').on('click', '.leafAppearanceNoB, .leafAppearanceB', function() {
        if(!$(this).hasClass('defAppearance')) {
            sourcePattern = /\/art\/border\//;
            var zoomOrRoom = 1;
            if($('#catalogDialogBox').css('display') == 'none') {
                zoomOrRoom = 0;
            }
            var imageSrc = '';
            if($('#imgHold').length) {
                imageSrc = $('#imgHold img.currentViewImg').attr('src').toString();
            }
            else {
                imageSrc = $('#roomImgHolder img.currentViewImg').attr('src').toString();
            }
            var borderImage = imageSrc;
            if($(this).attr('class') == 'leafAppearanceB') {
                if(!sourcePattern.test(imageSrc.toString())) {
                    borderImage = imageSrc.replace('/art/', '/art/border/');
                }
                $('img.leafAppearance').attr('src', borderImage);
                setArtCategoryImgPositionSize('b', zoomOrRoom);
            }
            else {
                if(sourcePattern.test(imageSrc)) {
                    borderImage = imageSrc.replace('/art/border/', '/art/');
                }
                $('img.leafAppearance').attr('src', borderImage);
                setArtCategoryImgPositionSize('nb', zoomOrRoom);
            }
        }
    });

    $('ul#catalogItemList').on('click', 'span.roomModel', function() {
        if($.browser.mozilla || $.browser.safari || $.browser.webkit ) {
        var currentActonElement = ($(this).hasClass('roomModel')) ? $(this).parent().prevAll('img.modelPicture') : $(this) ;
        var imgSrc = $(currentActonElement).attr('src');
        var modelName = $(currentActonElement).data('modelname');
        var modelPrefix = $(currentActonElement).data('modelprefix');
        var categoryId = $(currentActonElement).data('categoryid');
        var isModelPicture = $(currentActonElement).hasClass('modelPicture');
        var isPictureInArtMode = $('.artSamples').find('img[data-modelname="' + ('0' + modelName.toString()).slice(-2) + '"]').length;
            if((categoryId == 6 && $('.artSamples').length && isPictureInArtMode) || (categoryId == 7 && $('.artSamples').length && isPictureInArtMode)) {
                var modelPicture = $(currentActonElement).next('img.modelPictureImage').attr('src');
            }
        $('div#room-window').dialog({
                title: "Комната",
		resizable: false,
		height:620,
                width: 800,
		modal: true,
                open: function(e, ui) {
                    if(isModelPicture) {
                        var dialogPatterns = $(patterns).clone(false);
                        $(dialogPatterns).on('click', 'li', function() {
                            $('ul#dialogPattern li img').removeClass('activePattern').addClass('colorPattern');
                            $('img', this).removeClass('colorPattern').addClass('activePattern');
                            //if(($('select#catalogCategories option:selected').val() != 6) && ($('select#catalogCategories option:selected').val() != 7)) {
                            if(($('.activeMenuCategory').data('categoryid') != 6) && ($('.activeMenuCategory').data('categoryid') != 7)) {
                            $('div#room-window div#roomImgHolder').fadeOut(500);
                            queryColor();
                            }
                            else {
                                var colorId = $(this).data('colorid');
                                var src = $('#roomImgHolder img.currentViewImg').attr('src');
                                var artPatternColor = '6'; // !!! important art category is default = 6 // $('select#catalogCategories option:selected').val()
                                src = src.replace(/\/6-[0-9]{1,3}/gi, '/'+artPatternColor+'-'+colorId);
                                $('#roomImgHolder img.currentViewImg').prop('src', src);
                                $('div#room-window div.currentPatternName span.currentPattern').text($('ul#dialogPattern li img.activePattern').attr('title'));
                            }
                        });
                        $('div#room-window div#colorPatterns').empty();
                        $('div#room-window div#colorPatterns').prepend(dialogPatterns);
                        $('div#room-window #patternHolder').css({width: '435px', height: '110px'});
                        $('div#room-window #patternHolder ul#colorsMatch').attr('id', 'dialogPattern');
                        var dialogIndexColor = null;
                        if( $('#colorsMatch li:not(.pager):has(img.activePattern)').length ) {
                            dialogIndexColor = $('#colorsMatch li:not(.pager):has(img.activePattern)').data('colorindex');
                        }
                        else {
                            dialogIndexColor = $('#colorsMatch li.pager:has(img.activePattern)').data('colorindex');
                        }
                        var slideQty = $('div#patternHolder').data('colorcount');
                        var slideMove = $('div#patternHolder').data('colorcount');
                        if((categoryId == 6 && $('.artSamples').length && isPictureInArtMode) || (categoryId == 7 && $('.artSamples').length && isPictureInArtMode) ) {
                            slideQty = 4; slideMove = 4;
                            $('div#room-window #patternHolder').css({height: '110px', float: 'left', overflow: 'hidden', 'width': '300px', 'display': 'inline-block', 'padding-left': '55px'});
                        }
                        var dialogSlider = $('div#room-window ul#dialogPattern').bxSlider({
                            displaySlideQty: slideQty,
                            moveSlideQty: slideMove
                        });
                        dialogSlider.goToSlide(dialogIndexColor, false);
                        var dialogActivePattern = $('div#room-window ul#dialogPattern li.pager').get(dialogSlider.getCurrentSlide());
                        $('img.colorPattern', dialogActivePattern).removeClass('colorPattern').addClass('activePattern');
                        $('div#room-window #patternHolder').prepend($('<div>').addClass('currentPatternName'));
                        $('div#room-window div.currentPatternName').append($('<span>').text('Текущий цвет: '));
                        $('div#room-window div.currentPatternName').append($('<span>').addClass('currentPattern'));
                        $('div#room-window div.currentPatternName span.currentPattern').text($('img.activePattern').attr('title'));
                    }
                    $('div#room-window img.currentViewImg').data({'modelname': modelName, 'categoryid': categoryId}).css({'z-index': '20'}).attr('src', $(currentActonElement).attr('src'));
                    // Hardcoded for Art category
                    if((categoryId == 6 && $('.artSamples').length && isPictureInArtMode) || (categoryId == 7 && $('.artSamples').length && isPictureInArtMode)) {
                        $('div#room-window img.currentViewImg').addClass('currentViewImg leafAppearance');
                        var sourcePattern = /\/art\/border\//;

                        $('div#room-window div#colorPatterns').append($('<div>').attr({'id': 'artSamplesHolder'}).css({'width': '280px', 'margin': '0px auto', 'display': 'inline-block', 'margin-left': '50px'}));
                        $('div#room-window div#colorPatterns #artSamplesHolder').append($('<div class="currentPatternName">Другие фото из каталога:</div>'));
                        $('div#room-window div#colorPatterns #artSamplesHolder').append($('.artSamples').clone(false));
                        $('div#room-window div#colorPatterns #artSamplesHolder img.pictureArt').css({'width': '43px', 'height': '75px'});
                        $('div#room-window div#colorPatterns .artSamples').css({'height': '92px', 'display': 'block'});
                        $('div#room-window div#colorPatterns .artSamples li').css({'width': '55px', 'height': '92px'});
                        var bsSliderNumberSlides = $('div#room-window div#colorPatterns .artSamples').data('picturecount');
                        var dialogArtSamples = $('div#room-window div#colorPatterns .artSamples').bxSlider({
                            displaySlideQty: 4,
                            moveSlideQty: 3
                        });
                        if(categoryId == 7) {
                            $('#artSamplesHolder').css('margin-left','135px');
                        }
                        if(categoryId == 6) {
                            $('<div id="leafAppearanceChoice" style="display: inline-block; width: 85px; text-align: center; float: left; overflow: hidden;" class="currentPatternName">Вид полотна:' +
                                '<img class="leafAppearanceNoB" src="' + $('div#room-window .artSamples').data('pluginurl') + '/images/sample/door/noBorder.png' + '" width="35px" height="70px" style="cursor: pointer;" />' +
                                '<img class="leafAppearanceB" src="' + $('div#room-window .artSamples').data('pluginurl') + '/images/sample/door/border.png' + '" width="35px" height="70px" style="cursor: pointer; margin-left:5px;" />' +
                                '</div>').insertBefore('div#room-window div#artSamplesHolder');

                            if(sourcePattern.test(imgSrc.toString())) {
                                $('div#room-window img.leafAppearanceB').addClass('defAppearance');
                            }
                            else {
                                $('div#room-window img.leafAppearanceNoB').addClass('defAppearance');
                            }
                        }
                        //$('div#room-window div#imgHold').append($('<img>').attr({'src': imgSrc.toString() + '?' + Math.random(), 'width': '275px', 'height': '550px', 'alt': ''}).addClass('currentViewImg leafAppearance').data({'modelname': modelName, 'categoryid': categoryId}));
                        var handleFileName = 'handle';
                        var handleLetPosition = '13px';
                        if(categoryId == 7) {
                            handleFileName = 'handleG';
                            handleLetPosition = '11px';
                            $('#roomImgHolder').append($('<img>').attr({'src': $('div#room-window .artSamples').addClass('artHinge').data('pluginurl') + '/images/sample/door/hinge.png' + '?' + Math.random(), 'width': '14px', 'height': '10px', 'alt': ''}).css({'position': 'absolute', 'top': '35px', 'left': '84px', 'z-index': '31'}));
                            $('#roomImgHolder').append($('<img>').attr({'src': $('div#room-window .artSamples').addClass('artHinge').data('pluginurl') + '/images/sample/door/hinge.png' + '?' + Math.random(), 'width': '14px', 'height': '10px', 'alt': ''}).css({'position': 'absolute', 'top': '179px', 'left': '84px', 'z-index': '31'}));
                        }
                        $('#roomImgHolder').append($('<img>').attr({'src': $('div#room-window .artSamples').addClass('artHandler').data('pluginurl') + '/images/sample/door/'+handleFileName+'.png' + '?' + Math.random(), 'width': '16px', 'height': '7px', 'alt': ''}).css({'position': 'absolute', 'top': '112px', 'left': handleLetPosition, 'z-index': '31'}));
                        if(!sourcePattern.test(imgSrc.toString())) {
                            $('div#roomImgHolder').append($('<img>').attr({'src': modelPicture + '?' + Math.random(), 'alt': ''}).addClass('currentViewArtImg').css({'position': 'absolute', 'top': '10px', 'left': '9px', 'width': '85px', 'height': '212px', 'z-index': '10'}));
                        }
                        else {
                            $('div#roomImgHolder').append($('<img>').attr({'src': modelPicture + '?' + Math.random(), 'alt': ''}).addClass('currentViewArtImg').css({'position': 'absolute', 'top': '22px', 'left': '21px', 'width': '62px', 'height': '183px', 'z-index': '10'}));
                        }
                        $('div#room-window').on('click', '.artSamples li',function() {
                            if(!$('div#roomImgHolder img.currentViewArtImg').length) {
                                $('div#roomImgHolder').append($('<img>').attr({'src': $('img', this).attr('src') + '?' + Math.random(), 'width': '186px', 'height': '465px', 'alt': ''}).addClass('currentViewArtImg').css({'position': 'absolute', 'top': '96px', 'left': '45px', 'z-index': '9'}));
                            }
                            else {
                                $('div#roomImgHolder img.currentViewArtImg').attr({'src': $('img', this).attr('src') + '?' + Math.random()});
                            }
                            //$('div#room-window .modelTitle p').text($('img', this).data('modelprefix') + '-' + ('0' + $('img', this).data('modelname').toString()).slice(-2) );
                        });
                    }
                },
                close: function() {
                    $('#room-window #colorPatterns').empty(); $('#room-window #roomImgHolder img.currentViewArtImg, #roomImgHolder .artHandler, #room-window #artSamplesHolder').remove(); $(this).dialog('destroy');
                },
                buttons: {
                    "Сменить интерьер":function() {$('div#sampels').dialog({
                                title: "Комната",
                                resizable: false,
                                height:520,
                                width: 640,
                                modal: true,
                                open: function(e, ui) {
                                        $('#wallSample').fadeIn(100);
                                        $('#floorSample').fadeIn(100);
                                },
                                beforeClose: function() {
                                    $('#wallSample').fadeOut(100);
                                    $('#floorSample').fadeOut(100);
                                },
                                buttons: {
                                    "Применить": function() {
                                        if($('ul#wallSample li.wallpaperSampleActive').length) {
                                            $('#centerWall, #leftWall, #rightWall').css('background-image', $('ul#wallSample li.wallpaperSampleActive').css('background-image'));
                                            document.cookie = "chosenWall="+$('ul#wallSample li.wallpaperSampleActive').css('background-image')+"; expires="+setCookiePeriod(30)+";domain=;path=/";
                                        }
                                        if($('ul#floorSample li.floorSurefaceSampleActive').length) {
                                            $('#floor').css('background-image', $('ul#floorSample li.floorSurefaceSampleActive').css('background-image'));
                                            document.cookie = "chosenFloor="+$('ul#floorSample li.floorSurefaceSampleActive').css('background-image')+"; expires="+setCookiePeriod(30)+";domain=;path=/";
                                        }
                                        $(this).dialog('close');
                                    },
                                    "Закрыть": function() {$(this).dialog('close');}
                                }
                                });
                     },
                    "Закрыть": function() {
                        $(this).dialog('close');
                     }
                }
        });
        }
        else{
            $('div#browser-allert-window').dialog({
                title: "Поддерживаемые браузеры",
		resizable: false,
		height:120,
                width: 320,
		modal: true,
                open: function(e, ui) {}
            });
        }
    });

    $('ul#wallSample').on('click', 'li.wallpaperSample', function() {
        $('li.wallpaperSample').removeClass('wallpaperSampleActive').css('border', '2px solid #8d8e8e');
        $(this).addClass('wallpaperSampleActive').css('border', '2px solid #DE5328');
    });

    $('ul#floorSample').on('click', 'li.floorSurefaceSample', function() {
        $('li.floorSurefaceSample').removeClass('floorSurefaceSampleActive').css('border', '2px solid #8d8e8e');
        $(this).addClass('floorSurefaceSampleActive').css('border', '2px solid #DE5328');
    });

    $('span.currentPattern').text($('ul#colorsMatch img.activePattern').attr('title'));

    $('ul#catalogItemList').on('click', 'div.likedModel', function() {
        // category / model / color //
        if(typeof likedModels == 'string') {
            likedModels = eval('(' + likedModels + ')');
        }
        var key = $(this).data('likecategory').toString()+('0' + $(this).data('likemodel')).slice(-2)+$('#colorsMatch li:has(img.activePattern)').data('colorid').toString();
        var val = $(this).data('likecategory') + '_' + ('0' + $(this).data('likemodel')).slice(-2) + '_' + $('#colorsMatch li:has(img.activePattern)').data('colorid');
        if($(this).data('likecategory') == 6 && ($(this).data("artb") !== undefined)) {
            val += '_b'
        }
        if(key.toString() in likedModels) {
            var reKey = key*1;
            delete likedModels[reKey];
            $(this).removeClass('likedModelActive');
        }
        else {
            likedModels[key.toString()] = val;
            $(this).addClass('likedModelActive');
        }

        var queryLike = '';
        for (key in likedModels) {
                queryLike += likedModels[key]+'-';
        }
        if(queryLike != '') {
            queryLike = queryLike.substr(0, queryLike.length-1);
            $('div.haveLikedModels>a.likeLink').attr('href',$('div.haveLikedModels').data('likeurl')+queryLike);
            $('div.haveLikedModels').show('fast');
        }
        else {
            $('div.haveLikedModels>a.likeLink').attr('href','#');
            $('div.haveLikedModels').hide('fast');
        }

        likedModels = JSON.stringify(likedModels);
        document.cookie = "favoriteDoors="+likedModels+"; expires="+setCookiePeriod(30)+";domain=;path=/";
        return false;
    });

    $('ul#catalogItemList').on('click', 'span.dislike', function() {
        var reKey = $(this).data('querykey');
        if(typeof likedModels == 'string') {
            likedModels = eval('(' + likedModels + ')');
        }
        delete likedModels[reKey];
        var queryLike = '';
        for (key in likedModels) {
                queryLike += likedModels[key]+'-';
        }
        if(queryLike != '') {
            queryLike = queryLike.substr(0, queryLike.length-1);
        }
        if(queryLike == '') {
            var catalogLOcation = $(this).data('likeurl').toString().replace('?likeQuery=', '');
            likedModels = JSON.stringify(likedModels);
            document.cookie = "favoriteDoors="+likedModels+"; expires="+setCookiePeriod(30)+";domain=;path=/";
            window.location = catalogLOcation;
            return false;
        }
        likedModels = JSON.stringify(likedModels);
        document.cookie = "favoriteDoors="+likedModels+"; expires="+setCookiePeriod(30)+";domain=;path=/";
        window.location = $(this).data('likeurl')+queryLike;
        return false;
    });

   modelViewLinks();
});

function setupFolderModel(currentActonElement, imgSrc, sourcePattern, modelName, categoryId) {
    var handleName = 'handle';
    var handleLeftPosition = '55px';
    if(categoryId == 7) {
        handleName = 'handleG';
        handleLeftPosition = '47px';
    }
    var modelPicture = $(currentActonElement).next('img.likedModelImage').attr('src');
    $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': imgSrc.toString() + '?' + Math.random(), 'width': '275px', 'height': '550px', 'alt': ''}).addClass('currentViewImg').data({'modelname': modelName, 'categoryid': categoryId}));
    $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': $(currentActonElement).data('pluginurl') + '/images/sample/door/'+handleName+'.png' + '?' + Math.random(), 'width': '32px', 'height': '12px', 'alt': ''}).css({'position': 'absolute', 'top': '321px', 'left': handleLeftPosition, 'z-index': '10'}));
    if(categoryId == 7) {
        $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': $(currentActonElement).data('pluginurl') + '/images/sample/door/hinge.png' + '?' + Math.random(), 'width': '30px', 'height': '21px', 'alt': ''}).css({'position': 'absolute', 'top': '145px', 'left': '213px', 'z-index': '10'}));
        $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': $(currentActonElement).data('pluginurl') + '/images/sample/door/hinge.png' + '?' + Math.random(), 'width': '30px', 'height': '21px', 'alt': ''}).css({'position': 'absolute', 'top': '467px', 'left': '213px', 'z-index': '10'}));
    }
    if(!sourcePattern.test(imgSrc.toString())) {
        $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': modelPicture + '?' + Math.random(), 'alt': ''}).css({'position': 'absolute', 'top': '96px', 'left': '44px', 'width': '187px', 'height': '465px', 'z-index': '-1'}));
    }
    else {
        $('div#catalogDialogBox div#imgHold').append($('<img>').attr({'src': modelPicture + '?' + Math.random(), 'alt': ''}).css({'position': 'absolute', 'top': '122px', 'left': '70px', 'width': '135px', 'height': '401px', 'z-index': '-1'}));
    }
}

function queryModels() {
    var data = {
        action: 'queryModels',
        category: $('.activeMenuCategory').data('categoryid'),//$('select#catalogCategories option:selected').val(),
        color: $('ul#colorsMatch li img.activePattern').closest('li').data('colorid'),
        newMarkerPlace: $('input[name="newMarkerPlace"]').val()
    };
    $.get(ajaxLink.ajaxurl, data, function(response){
        $('ul#catalogItemList').empty().html(response);
        $('ul#catalogItemList img.modelPicture').hide();
        $('ul#catalogItemList img.modelPicture').load(function() {
            $('ul#catalogItemList img.modelPicture').fadeIn(1500);
        });
        getSettedUpCookie('favoriteDoors');
        $('img.modelPicture').bind('contextmenu', function(e){
            return false;
        });
        modelViewLinks();
    }, 'html');
}

function queryColor() {
    var isRoom = $('div#room-window').dialog('isOpen');
    if(isRoom !== true) {isRoom = false;}
    if(isRoom) {$('div#room-window div.currentPatternName span.currentPattern').text($('ul#dialogPattern li img.activePattern').attr('title'));}
    else{$('div#catalogDialogBox div.currentPatternName span.currentPattern').text($('ul#dialogPattern li img.activePattern').attr('title'));}
    var currentImageToView = null;
    if(isRoom) {currentImageToView = $('div#room-window img.currentViewImg');}else{currentImageToView = $('div#catalogDialogBox img.currentViewImg');}
    var data = {
        action: 'queryColor',
        modelName: ('0' + $(currentImageToView).data('modelname').toString()).slice(-2),
        color: $('ul#dialogPattern li img.activePattern').closest('li').data('colorid'),
        categoryId: $(currentImageToView).data('categoryid')
    };
    if(isRoom) {
        data['small'] = true;
    }
    $.get(ajaxLink.ajaxurl, data, function(response) {
        $(currentImageToView).attr('src', response.imageSrc); //'img.currentViewImg'
        $(currentImageToView).load(function() { //'div#catalogDialogBox img.currentViewImg'
                if(isRoom) {
                $('div#roomImgHolder').fadeIn(1000);
            }
            else{
                $('div#catalogDialogBox div#imgHold').fadeIn(1000);
            }
        });
        //$('ul#catalogItemList').empty().html(response);
        $('img.modelPicture').bind('contextmenu', function(e){
            return false;
        });
    }, 'json');
}


function setCookiePeriod(days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    return date.toGMTString();
}

function getSettedUpCookie(name) {
    var results = document.cookie.match ( '(^|;) ?' + name + '=([^;]*)(;|$)' );
    if ( results ) {
        switch (name) {
            case 'favoriteDoors':
                likedModels = eval('(' + unescape(results[2]) + ')');
                if(likedModels != null) {
                    var key;
                    var queryLike = '';
                    for (key in likedModels) {
                        if($('div.likedModel[data-likekey="'+key+'"]').length) {
                            $('div.likedModel[data-likekey="'+key+'"]').addClass('likedModelActive');
                        }
                        queryLike += likedModels[key]+'-';
                    }
                    if(queryLike != '') {
                        queryLike = queryLike.substr(0, queryLike.length-1);
                        $('div.haveLikedModels>a.likeLink').attr('href',$('div.haveLikedModels').data('likeurl')+queryLike);
                        $('div.haveLikedModels').show('fast');
                    }
                    else {
                        $('div.haveLikedModels>a.likeLink').attr('href','#');
                        $('div.haveLikedModels').hide('fast');
                    }
                }
                return likedModels;
                break;
            case 'chosenWall':
                $('#centerWall, #leftWall, #rightWall').css('background-image', unescape(results[2]));
                break;
            case 'chosenFloor':
                $('#floor').css('background-image', unescape(results[2]));
                break;
        }
    }
    else {
        return null;
    }
}

function modelViewLinks() {
    $('.boxgrid.captionfull').hover(function() {
            $(".cover", this).stop().animate({top:'125px'},{queue:false,duration:400});
            $(".coverZoom", this).stop().animate({top:'75px'},{queue:false,duration:400});
        },
        function() {
            $(".cover", this).stop().animate({top:'250px'},{queue:false,duration:300});
            $(".coverZoom", this).stop().animate({top:'-51px'},{queue:false,duration:300});
    });
}

})(jQuery);
