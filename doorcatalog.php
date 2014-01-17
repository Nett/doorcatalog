<?php
/*
  Plugin Name: Door Catalog
  Plugin URI:
  Description: Store products data.  Use of plugin (использование):
         - В темплэйтах <strong> <?php if(function_exists('doorCatalog')) { doorCatalog('catalog', 1);} ?&gt;</strong>
            где doorCatalog('catalog', 1, 'img') функция вызова плагина.
            В функцию передаются 3 параметра.
                1) Имя страницы на которой размещён каталог;
                2) Флаг режима отображения (0 или 1), 1 - режим "Каталога",
                    а 0 режим случайного выбора категорий и моделей со ссылками на каталог (на главное странице всегда режим случайного выбора).
                3) Режим отображения маркера для новых моделей "Новинка / NEW"
                    - ключевые слова: (title, img, all);
                        title - отображает маркер указанный в конфиге на заголовке модели, рядом с именем модели;
                        img - отображает маркер на картинке;
                        all - маркер будет на двух выше указанных позициях.
         - В контенте возможно использование так называегого "ШортКода"(ShortCode).
                Для этого используйте данную последовательность (конструкцию)
                <strong>[DoorCatalogPlF page="catalog" iscatalog="1" marker="img"]</strong> где так-же передаются 3 параметра.
  Version: 1677
  Author: Oleg_Malii
  Author URI:
  License: GPL2
 */
?>

<?php
define("DONOTCACHEPAGE", "doorcatalog");
const SELECT_MODE_ALL = 'all';
const SELECT_MODE_RANDOM = 'random';
const SELECT_MODE_CONDITION = 'condition';
const SELECT_CATEGORY_COLORS = 'colors';
const SELECT_CATEGORY_IMAGE = 'image';
const SELECT_CATEGORY_ID = 'category';

const NEW_MARKER_TITLE = 'title';
const NEW_MARKER_IMG = 'img';
const NEW_MARKER_ALL = 'all';

add_action('admin_menu', 'catalogAdminPanel');

function catalogAdminPanel() {
    add_options_page('My Plugin Options', 'Catalog Manager', 8, 'catalog_manager', 'catalogManager');
}

register_activation_hook(__FILE__, 'createCatalogDbTable');

function createCatalogDbTable() {
    global $wpdb;
    $dbTableName = $wpdb->prefix . 'door_catalog';
    if ($wpdb->get_var("show tables like $dbTableName") != $dbTableName) {
        $sql = "CREATE TABLE IF NOT EXISTS `$dbTableName` (
              `id` int(10) NOT NULL AUTO_INCREMENT,
              `category_id` int(10) DEFAULT NULL,
              `name` varchar(220) COLLATE utf8_unicode_ci DEFAULT NULL,
              `image` text COLLATE utf8_unicode_ci,
              `color` text COLLATE utf8_unicode_ci,
              `description` text COLLATE utf8_unicode_ci,
              PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;";
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    /*
     * 
     */
}

add_action('admin_head', 'adminHeaders');

function adminHeaders() {
    $siteurl = get_option('siteurl');
    $cssUrl = $siteurl . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/system/css/admin.css';
    echo "<link rel='stylesheet' type='text/css' href='$cssUrl' />\n";
    $cssUi = $siteurl . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/system/css/jquery-ui-1.8.18.custom.css';
    echo "<link rel='stylesheet' type='text/css' href='$cssUi' />\n";
    $jsUrl = $siteurl . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/system/js/admin.js';
    $jsLibUrl = $siteurl . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/system/js/jquery1.7.1.js';
    $jsUi = $siteurl . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/system/js/jquery-ui-1.8.18.custom.min.js';
    echo '<script type="text/javascript" src="' . $jsLibUrl . '" ></script>';
    echo '<script type="text/javascript" src="' . $jsUrl . '" ></script>';
    echo '<script type="text/javascript" src="' . $jsUi . '" ></script>';
}

function getConfig() {
        $pathToConfig = dirname(__FILE__).'/config/catalog.ini';
        $configFile = parse_ini_file($pathToConfig, true);
        $categories = $configFile['category'];
        $pattern = $configFile['pattern'];
        $prefix = $configFile['prefix'];
        $phrases = $configFile['phrases'];
        return array('category' => $categories, 'pattern' => $pattern, 'prefix' => $prefix, 'phrases' => $phrases);
}

function catalogManager() {
    if (is_admin()) {
    $config = getConfig();
    $categories = $config['category'];
    $pattern = $config['pattern'];
    $prefix = $config['prefix'];
    ?>

    <div id="managerContainer">
        <div class="formHeader">Каталог менеджер</div>

        
        <form id="catalogItem" action="" method="POST">
           <div style="float: left;">
                    <div class="rowContainer">
                        <label>Категория:</label>
                        <select name="category">
                            <option value="-1"></option>
                        <?php foreach ($categories as $key => $value) {?>
                            <option value="<?php echo $value;?>"><?php echo $key;?></option>
                        <?php }?>
                        </select>
                    </div>
                    <div class="rowContainer">
                        <label>Имя модели:</label>
                        <select name="prefix" style="width: 55px;" disabled="disabled">
                            <option value="-1"></option>
                            <?php foreach ($prefix as $k => $v) {?>
                            <option value="<?php echo $k;?>"><?php echo $v;?></option>
                            <?php }?>
                        </select> - 
                        <input type="text" name="modelName" value="" style="width: 135px;" />
                    </div>
                    <div class="rowContainer">
                        <label>Описание:</label>
                        <textarea name="description"></textarea>
                    </div>
                    <div class="rowContainer">
                        <input id="addItem" name="addItem" type="submit" value="Добавить / Изменить" />
                        <input id="cleanForm" name="cleanForm" type="submit" value="Очистить форму" />
                    </div>
               
                <div>
                    <p style="text-align: center; font-size: 14px; font-weight: bold; background-color: #fcfcfc; padding: 3px; border-top: 2px solid #8d8e8e;">Список моделей:</p>
                    <ul id="modelList">
                        <?php buildCatalogList($prefix); ?>
                    </ul>
                    <input type="button" id="automatedModel" name="automatedModel" value="Авто-модель" /> 
                    <input type="button" id="truncateModel" name="truncateModel" value="Удалить все модели." />
                </div>
            </div>
            
            <div style="float: left; margin-left: 15px;">
                <label style="float: none;">Расцветки:</label>
                    <ul class="colorsList">
                        <?php if( !empty ($pattern) ){
                            foreach($pattern as $color) {
                        ?>
                        <li>
                            <div class="patternHeaderText"><?php echo $color['name'];?></div>
                            <input type="checkbox" name="colorId" data-colorid="<?php echo $color['id']?>" />
                            <img class="pattern" src="<?php echo plugin_dir_url( __FILE__ ) . 'images/patterns/' . $color['image'];?>" alt="<?php echo $color['name'];?>" />
                            <div class="imageChoice"></div>
                        </li>
                        <?php }
                        }
                        ?>
                    </ul>
                    <select name="imagePicker">
                        <option value="-1"></option>
                    <?php
                        //$dorsImages = scandir(dirname(__FILE__).'/images/doors', 0);
                        $imagesDir = opendir(dirname(__FILE__).'/images/doors/original');
                        //if( !empty ($dorsImages) ) {
                            //foreach ($dorsImages as $key => $image) {
                            $imageFiles = array();
                            while (false !== ($image = readdir($imagesDir))) {
                                if( (trim($image) != '.') && (trim($image) != '..') ) {
                                    $imageFiles[] = iconv("cp1251", "UTF-8", $image);
                                }
                            }
                            unset($image);
                            closedir($imagesDir);
                            sort($imageFiles, SORT_ASC);
                             foreach ($imageFiles as $image) {   
                             ?>
                                <option value="<?php echo $image;?>"><?php echo $image;?></option>
                    <?php    }
                        //}

                     ?>
                    </select>
            </div>

        </form>
        <div>
                <div style="overflow: hidden; text-align: center; margin-top: 150px;">
                    <div id="imageName" style="font-weight: bold;"></div>
                    <img id="previewImg" src="<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/preview.jpg'?>" height="300px" width="150px" alt="Preview" data-imgurl="<?php echo $siteurl = get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/doors/small/';?>" />
                </div>
        </div>
    </div>
<div style="border: 1px solid red; overflow: hidden; padding: 3px; text-align: center;">Формат файла изображения <b>X-X-X.jpg</b> (в роли разделителя используется тире (-) )<br />(<i>Номер категории</i>-<i>Номер модели</i>-<i>Номер цвета</i>.расширение файла) E.g. <b>1-02-3.jpg</b></div>
<div id="remove-confirm" style="display: none;"></div>
        <input type="button" id="update-db-table" value="Update/ALTER Database table">
    <?php
}
}
?>

<?php
    function buildCatalogList($prefix) {
        $models = selectCatalogItems(SELECT_MODE_ALL ,array('category_id', 'name'));
        if(!empty ($models)) { //var_dump($models); die();
            foreach ($models as $key => $model) {
            ?>
                <li data-name="<?php echo $model['name'];?>"
                    data-category="<?php echo $model['category_id'];?>"
                    data-image="<?php echo str_replace(',', '|#|', $model['image']);?>"
                    data-color="<?php echo str_replace(',', '|#|', $model['color']);?>"
                    data-description="<?php echo $model['description'];?>"
                >
                    <span><?php echo ucfirst($prefix[$model['category_id']]) . ' - ' . $model['name']?></span>
                    <span style="padding-left: 15px; font-weight: bold;"> NEW
                        <input <?php if( isset($model['new']) && ($model['new'] === '1') ) {echo 'checked';} ?> type="checkbox" data-name="<?php echo $model['name'];?>" data-category="<?php echo $model['category_id'];?>" name="isNew"/>
                    </span>
                    <input type="button" name="removeModel" value="Удалить" style="float: right;" />
                </li>
<?php       }
        }
        else {
            echo 'Нет моделей.';
        }
    }
add_action('wp_ajax_returnCatalogList', 'returnCatalogList');
function returnCatalogList() {
    $config = getConfig();
    $categories = $config['category'];
    $pattern = $config['pattern'];
    $prefix = $config['prefix'];
    buildCatalogList($prefix);
    die();
}
    
    ?>

<?php
add_action('wp_ajax_addCatalogItem', 'addCatalogItem');

function addCatalogItem() {
    if (is_admin()) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'door_catalog';
        $requestedData = $_POST;
        unset ($requestedData['action']);
        $deleted = deleteDoorModel($requestedData['category'], $requestedData['name']);
        foreach ($requestedData['colorAndImage'] as $key => $items) {
            try{
            $wpdb->insert($table_name,
                array(
                'category_id' => (integer)$requestedData['category'],
                'name' => $requestedData['name'],
                'image' => $items['image'],
                'color' => (integer)$items['color'],
                'description' => $requestedData['description']
            ),
                array(
                   '%d', '%s', '%s', '%d', '%s'
                )
            );
            }catch (Exception $e) {
                echo json_encode(array('response' => $e->getMessage()));
                die();
            }
        }
        if($deleted == true) {
            echo json_encode(array('response' => 'Модель обновлена.'));
        }else{
            echo json_encode(array('response' => 'Модель добавлена.'));
        }
        die();
    }
}

add_action('wp_ajax_deleteCatalogItem', 'deleteCatalogItem');

function deleteCatalogItem() {
    if (is_admin()) {
        $requestedData = $_POST;
        deleteDoorModel((integer)$requestedData['category'], $requestedData['name'], true);
        die();
    }
}

function deleteDoorModel($categoryId, $name, $needResponse = null) {
    if (is_admin()) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'door_catalog';
        $deleteStatus = $wpdb->query(
            "DELETE FROM $table_name 
            WHERE category_id = $categoryId 
            AND name = '$name'"
        );
        if($needResponse != null) {
            echo json_encode(array('response' => 'Модель удалена.'));
        }
        else {
            return $deleteStatus;
        }
    }
}

add_action('wp_ajax_automatedModelProcess', 'automatedModelProcess');

function automatedModelProcess() {
    if (is_admin()) {
        $imagesDir = opendir(dirname(__FILE__).'/images/doors/original');
        $imageFiles = array();
        while (false !== ($image = readdir($imagesDir))) {
            if( (trim($image) != '.') && (trim($image) != '..') && (!is_dir($image)) ) {
                $imageFiles[] = iconv("cp1251", "UTF-8", $image);
            }
        }
        unset($image);
        closedir($imagesDir);
        sort($imageFiles, SORT_ASC);
        
        $imgToCheckIfExists = array();
        $existingImages = selectCatalogItems(SELECT_CATEGORY_IMAGE);
        if($existingImages) {
            foreach ($existingImages as $k => $v) {
                $imgToCheckIfExists[$k] = $v['image'];
            }
        }
        //var_dump($existingImages, $imgToCheckIfExists);
        global $wpdb;
        $table_name = $wpdb->prefix . 'door_catalog';
        /*mysql_connect(DB_HOST, DB_USER, DB_PASSWORD) or die(mysql_error());
        mysql_select_db(DB_NAME) or die(mysql_error());*/
        foreach ($imageFiles as $image) {
            $stringToExtractModelData = substr($image, 0, strpos($image,'.'));
            if( preg_match('/\d+-\d+-\d+/', $stringToExtractModelData) && !(in_array($image, $imgToCheckIfExists)) ) {
                $modelData = explode('-', $stringToExtractModelData);
                $wpdb->insert($table_name,
                    array(
                    'category_id' => (integer)$modelData[0],
                    'name' => $modelData[1],
                    'image' => $image,
                    'color' => (integer)$modelData[2],
                    'description' => ''
                ),
                    array(
                       '%d', '%d', '%s', '%d', '%s'
                    )
                );
                //mysql_query("INSERT INTO " . $table_name ." (category_id, name, image, color, description) VALUES(".(integer)$modelData[0].", ".$modelData[1].", '".$image."', ".(integer)$modelData[2].", '')");
            }
        }
        mysql_close();
        echo json_encode(array('response' => 'Модели созданы.'));
        die();
    }
}

add_action('wp_ajax_emptyCatalogTable', 'emptyCatalogTable');

function emptyCatalogTable() {
    if (is_admin()) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'door_catalog';
        $wpdb->query('TRUNCATE TABLE '.$table_name);
        echo json_encode(array('response'=>'Все модели удалены.'));
        die();
    }
}

add_action('wp_ajax_setNewInCatalog', 'setNewInCatalog');

function setNewInCatalog() {
    if (is_admin()) {
        $isNew = ($_POST['isNew'] === 'true') ? '1' : '0';
        $category = $_POST['category'];
        $name = str_pad($_POST['name'], 2, '0', STR_PAD_LEFT);
        global $wpdb;
        $table_name = $wpdb->prefix . 'door_catalog';
        try {
        $wpdb->update($table_name, array('new' => $isNew), array('category_id' => $category, 'name' => $name), array('%s'), array('%s', '%s'));
        }catch (Exception $e){var_dump($e->getMessage()); die();}
        echo json_encode(array('response'=>'Готово!'));
        die();
    }
}

add_action('wp_ajax_updateDbTable', 'updateDbTable');

function updateDbTable() {
    global $wpdb;
    $dbTableName = $wpdb->prefix . 'door_catalog';
    $wpdb->query("DROP TABLE IF EXISTS $dbTableName");
    if ($wpdb->get_var("show tables like $dbTableName") != $dbTableName) {
    $sql = "CREATE TABLE IF NOT EXISTS `wp_door_catalog` (
          `id` int(10) NOT NULL AUTO_INCREMENT,
          `category_id` int(10) DEFAULT NULL,
          `name` smallint(2) unsigned zerofill DEFAULT NULL,
          `image` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
          `color` int(10) DEFAULT NULL,
          `description` text COLLATE utf8_unicode_ci,
          `new` enum('1','0') COLLATE utf8_unicode_ci DEFAULT NULL,
          PRIMARY KEY (`id`),
          KEY `category_id` (`category_id`,`name`,`color`),
          KEY `category_id_2` (`category_id`,`color`)
        ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1;";
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        echo json_encode(array('response'=>'Done with it!'));
        die();
    }
}

/* $userSelect  -  allows users to query the database */
function selectCatalogItems($selectMode, $orderBy = array(), $condition = null, $userSelect = null) {
    if ( is_admin() || ($userSelect != null) ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'door_catalog';
        
        $where = ($condition != null) ? 'WHERE ' . $condition : '';
        $orderBy = (!empty ($orderBy)) ? implode(',', $orderBy) : 'name';
        $groupBy = array('C' => 'category_id', 'N' => 'name');
        
        switch ($selectMode) {
            case SELECT_MODE_ALL:
                $groupBy = implode(',', $groupBy);
                $query = "SELECT category_id, name, description, GROUP_CONCAT(image) as image, GROUP_CONCAT(color) as color, COUNT(DISTINCT name) as modelQty, new
                FROM $table_name $where 
                GROUP BY $groupBy  
                ORDER BY $orderBy";
            break;
        
            case SELECT_MODE_RANDOM:
                $query = "SELECT category_id, name, description, image, color, COUNT(DISTINCT name) as modelQty, new
                              FROM (SELECT * FROM $table_name ORDER BY RAND()) res GROUP BY category_id
                              ORDER BY FIELD(category_id, 1, 2, 3, 4, 5, 6) LIMIT 8";

                    /*"SELECT result.category_id, result.name, result.description, result.image, result.color, COUNT(DISTINCT result.name) as modelQty
                        FROM $table_name LEFT JOIN (SELECT * FROM wp_door_catalog ORDER BY RAND() ) result ON (wp_door_catalog.category_id = result.category_id) 
                        GROUP BY result.category_id 
                        ORDER BY FIELD(result.category_id, 1, 2, 3, 4, 5, 6) LIMIT 8"; // RAND()*/
                //var_dump($query); die();
            break;
        
            case SELECT_MODE_CONDITION:
                $query = "SELECT id, category_id, name, description, image, color, new
                        FROM $table_name $where 
                        ORDER BY $orderBy";
            break;
        
            case SELECT_CATEGORY_COLORS:
                $query = "SELECT DISTINCT color, new
                        FROM $table_name $where";
            break;
        
            case SELECT_CATEGORY_IMAGE:
                $query = "SELECT image 
                        FROM $table_name $where GROUP BY image";
            break;
        
            case SELECT_CATEGORY_ID:
                $query = "SELECT category_id 
                        FROM $table_name $where GROUP BY ".$groupBy['C']."";
            break;
        }
        
        $entries = $wpdb->get_results($query , ARRAY_A);
        return $entries;
    }
}


function room() { ?>
                <div id="room-window" style="display: none; overflow: hidden;">
                    <div id="colorPatterns"></div>
                    <div id="room-holder" style="height: 380px;">
    <div style="width: 650px; height: 325px; margin: 10px auto; border: none;" class="container">
            <div style="width: 100%; height: 100%; -moz-perspective: 350px; -moz-transform-style: preserve-3d; -moz-perspective-origin: top;
                 -webkit-perspective: 300px; -webkit-transform-style: preserve-3d; -webkit-perspective-origin: top;" class="cube">
            <!--<div style="display: block; position: absolute; width: 550px; height: 400px; border: none; line-height: 100px; font-family: arial, sans-serif; font-size: 60px; color: white; text-align: center; background: rgba(   0, 0, 0, 0.3 ); -moz-transform: translateZ( 50px );
                  -webkit-transform: translateZ( 50px ); " class="front">
            1</div>-->
            <div id="centerWall" style="display: block; position: absolute; width: 651px; height: 325px; border: none; line-height: 100px; font-family: arial, sans-serif; font-size: 60px; color: white; text-align: center; background: url(<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__));?>/images/sample/wall/38.jpg); color: black; -moz-transform: translateZ( -50px ); box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.4);/*-moz-background-size: 100%; -webkit-background-size: 100%;*/
                   -webkit-transform: translateZ( -50px );" class="back">
            </div>
            <div id="leftWall" style="display: block; position: absolute; width: 100px; height: 326px; border: none; line-height: 100px; font-family: arial, sans-serif; font-size: 60px; color: white; text-align: center; background: url(<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__));?>/images/sample/wall/38.jpg); -moz-transform: rotateY( 90deg) translateZ( 600px ); box-shadow: 0px 1px 7px rgba(0, 0, 0, 0.3); /*-moz-background-size: 100%; -webkit-background-size: 100%;*/
                    -webkit-transform: rotateY( 90deg) translateZ( 600px );" class="right">
            </div>
            <div id="rightWall" style="display: block; position: absolute; width: 100px; height: 326px; border: none; line-height: 100px; font-family: arial, sans-serif; font-size: 60px; color: white; text-align: center; background: url(<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__));?>/images/sample/wall/38.jpg); -moz-transform: rotateY(90deg) translateZ( -50px ); box-shadow: 0px 1px 7px rgba(0, 0, 0, 0.3); /*-moz-background-size: 100%; -webkit-background-size: 100%;*/
                    -webkit-transform: rotateY(90deg) translateZ( -50px );" class="left">
            </div>
            <!--<div style="display: block; position: absolute; width: 100px; height: 100px; border: none; line-height: 100px; font-family: arial, sans-serif; font-size: 60px; color: white; text-align: center; background: rgba( 196, 196,   0, 0.7 ); -moz-transform: rotateX( 90deg) translateZ( 50px );
                    -webkit-transform: rotateX( 90deg) translateZ( 50px );" class="top">
            5</div>-->
            <div id="floor" style="display: block; position: absolute; width: 650px; height: 100px; border: none; line-height: 100px; font-family: arial, sans-serif; font-size: 60px; color: white; text-align: center; background: url(<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__));?>/images/sample/floor/2.jpg); -moz-transform: rotateX(-90deg) translateZ( 275px ); box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.7); 
                    -webkit-transform: rotateX(-90deg) translateZ( 275px );" class="bottom">
            </div>
            <div id="roomImgHolder" style="-moz-transform: translate(280px, 60px); -webkit-transform: translate(280px, 55px); background-color: transparent;  height: 224px; overflow: hidden; position: relative; width: 104px;"> 
                <img class="currentViewImg modelPicture" src="#" height="250px" width="125px" alt="" style="left: -11px; position: absolute; top: -19px;" />
            </div>
        </div>
    </div>
                   </div>
</div>
                <div id="sampels" style="display: none;">
                    <div style="color:red"> Выбрать обои </div>
                    <ul id="wallSample" style="display: none; width: 600px; margin: 2px auto; overflow-y: scroll; overflow-x: hidden; height: 175px;">
                    <?php 
                    $imagesDir = opendir(dirname(__FILE__).'/images/sample/wall');
                    $imageFiles = array();
                    while (false !== ($image = readdir($imagesDir))) {
                        if( (trim($image) != '.') && (trim($image) != '..') && (!is_dir($image)) ) {?>
                        <li class="wallpaperSample" style="width: 60px; height: 60px; display: inline-block; vertical-align: middle; border: 2px solid #8d8e8e; margin: 2px; cursor: pointer; background-image: url(<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/sample/wall/' . $image;?>);"></li>
                        <?php }
                    }
                    unset($image);
                    closedir($imagesDir);
                    ?>
                    </ul>
                    <div style="color:red">Выбрать пол</div>
                    <ul id="floorSample" style="display: none; width: 600px; margin: 2px auto; overflow-y: scroll; overflow-x: hidden; height: 175px;">
                    <?php 
                    $imagesDir = opendir(dirname(__FILE__).'/images/sample/floor');
                    $imageFiles = array();
                    while (false !== ($image = readdir($imagesDir))) {
                        if( (trim($image) != '.') && (trim($image) != '..') && (!is_dir($image)) ) {?>
                        <li class="floorSurefaceSample" style="width: 60px; height: 60px; display: inline-block; vertical-align: middle; border: 2px solid #8d8e8e; margin: 2px; cursor: pointer; background-image: url(<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/sample/floor/' . $image;?>);"></li>
                        <?php }
                    }
                    unset($image);
                    closedir($imagesDir);
                    ?>
                    </ul>
                </div>
                
                <div id="browser-allert-window" style="display:none; text-align: center; font-size: 14px; font-weight: normal;">
                    Для корректного просмотра выбранной модели двери в данном режиме необходимо использовать следующие браузеры:
                    <p style="text-align: center; font-size: 16px; margin-top: 20px;">Mozilla Firefox</p>
                    <p style="text-align: center; font-size: 16px;">Google Chrome</p>
                </div>
<?php }


function doorCatalog($catalogPage, $catalogFlag = false, $newMarkerPlace) {
    $config = getConfig();
    $categories = $config['category'];
    $pattern = $config['pattern'];
    $prefix = $config['prefix'];
    ?>
                
                
    <div id="catalogDialogBox" style="display: none;"></div>
    <!--<div id="catalogHolder">-->
    <?php
    
    
    if($_GET['likeQuery']) {?>
    <div class="backToCatalog"><a class="likeLink" href="<?php echo get_option('siteurl').'/'.$catalogPage;?>">Вернуться в каталог</a></div>
    <ul id="catalogItemList">
    <?php
        $likeQuery = explode('-', $_GET['likeQuery']);
        foreach ($likeQuery as $query) {
            $components = explode('_', $query);
            $condition = 'category_id = '.$components[0].' AND name = '.$components[1].' AND color = '.$components[2];
            $selectedItems[] = selectCatalogItems(SELECT_MODE_CONDITION, array(), $condition, true);
        }
        foreach ($selectedItems as $item) {
            foreach ($item as $model){?>
                <li>
                 <div class="modelTitle">
                    <p>
                     <?php 
                        echo preg_replace('/^\s*(\S)/eu',"mb_strtoupper('\\1', 'UTF-8')",  $prefix[$model['category_id']].'-'. $model['name']);//ucfirst(array_search($model['category_id'], $categories));
                     ?>
                     </p>
                 </div>
                 <div class="itemImage">
                    <span class="dislike ui-icon ui-icon-closethick" title="Убрать" data-likeurl="<?php echo get_option('siteurl').'/'.$catalogPage.'?likeQuery=';?>" data-querykey="<?php echo $model['category_id'].$model['name'].$model['color'];?>"></span>
                    <img class="likedModelPicture" data-categoryid="<?php echo $model['category_id']?>" data-modelprefix="<?php echo $prefix[$model['category_id']];?>" data-modelname="<?php echo $model['name'];?>" src="<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/doors/small/'.$model['image'] ?>" height="250px" width="125px" alt="" />
                 </div>
             </li>
                
                
            <?php }
        }
        die();
        ?>
    </ul>
    <?php
    }
    else if( is_front_page() || !$catalogFlag ) { // Main mode - displays all existing categories
         $models = selectCatalogItems(SELECT_MODE_RANDOM, array(), null, true);
         ?>
    <div class="haveLikedModels" data-likeurl="<?php echo get_option('siteurl').'/'.$catalogPage.'?likeQuery=';?>"><a class="likeLink" href="#">Понравившиеся модели</a></div>
    <ul id="catalogItemList" <?php if(!$catalogFlag){ ?>class="noFixedWidth"<?php }?>>
             <?php 
             if(!empty ($models)) {
                foreach ($models as $k => $model) {
             ?>
                <li>
                    <a href="<?php echo get_option('siteurl') . '/' . $catalogPage . '?category=' . $model['category_id'] . '';?>" title="">
                        <div class="categoryTitle">
                            <p><span class="sample">Серия</span>
                             <?php $model['name'];
                                echo preg_replace('/^\s*(\S)/eu',"mb_strtoupper('\\1', 'UTF-8')", array_search($model['category_id'], $categories));
                             ?>
                             </p>
                             <span>
                                 Моделей в серии:
                             <?php
                                echo $model['modelQty'];
                             ?>
                             </span>
                         </div>
                     </a>
                    <div class="itemImage" style="overflow: hidden; position: relative;">
                        <a href="<?php echo get_option('siteurl') . '/' . $catalogPage . '?category=' . $model['category_id'] . '';?>" title="">
                            <?php echo ((integer)$model['new'] === 1) ? '<span class="newModelMarker">' . $config['phrases']['new'] . '</span>' : ''; ?>
                            <img class="modelPictureCategoryViewer" src="<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/doors/small/'.$model['image'] ?>" height="250px" width="125px" alt="" />
                        </a>
                    </div>
                </li>
             <?php
                }
             }
             else {
                 echo 'Нет данных.';
             }
             ?>
             </ul>
    <?php
    }
    else {
        room();	
        ?>
        <a class="priceLink" style="display: none; margin: 3px;" href="<?php echo $config['phrases']['priceLink'];?>" target="_blank"><?php echo $config['phrases']['priceText'];?></a>
        <a class="constructionLink" style="display: none; margin: 3px;" href="<?php echo $config['phrases']['constructionLink'];?>" target="_blank"><?php echo $config['phrases']['constructionText'];?></a>
        <?php
        $categoryIds = selectCatalogItems(SELECT_CATEGORY_ID, array(), null, true);
        if(empty ($categoryIds) ) {echo 'Нет даных'; return false;}
        $condition = 'category_id = ';
        if(isset($_GET['category'])) {
            $categoryId = $_GET['category'];
        }
        else {
            $categoryId = $categoryIds[array_rand($categoryIds)]['category_id'];
        }
        $condition .= $categoryId;
        $condition .= ' AND color = ';
       
        $colorNum = null;
        
        $colorCondition = 'category_id = ' . $categoryId;
        if(isset($_GET['color'])) {$colorCondition .= ' AND color = ' . $_GET['color'];}
        $colors = selectCatalogItems(SELECT_CATEGORY_COLORS, array(), $colorCondition, true);
        if(!empty($colors) && isset($_GET['color'])) {
            $colorCondition = 'category_id = ' . $categoryId;
            $colors = selectCatalogItems(SELECT_CATEGORY_COLORS, array(), $colorCondition, true);
            $condition .=  $_GET['color'];
            $colorNum = $_GET['color'];
        }
        else {
            $colorCondition = 'category_id = ' . $categoryId;
            $colors = selectCatalogItems(SELECT_CATEGORY_COLORS, array(), $colorCondition, true);
            $colorNum = $colors[array_rand($colors)]['color'];
            $condition .= $colorNum;
        }
        $selectedItems = selectCatalogItems(SELECT_MODE_CONDITION, array(), $condition, true);
        ?>
        <div id="catalogControlPanel">
            <span class="modelDescription" style="display: none;"><?php echo $config['phrases']['modeldesc-'.$categoryId];?></span>
            <div style="text-align: center">
            <span style="vertical-align: middle; font-size: 15px; font-weight: bold;">Выберите серию дверей:</span>
            <select id="catalogCategories">
            <?php
                foreach ($categoryIds as $categorySearchId) {
             ?>
                <option value="<?php echo $categorySearchId['category_id'];?>" <?php if($categorySearchId['category_id'] == $categoryId) {echo ' selected="selected" ';}?> data-categoryurl="<?php echo get_option('siteurl').'/'.$catalogPage.'?category='.$categorySearchId['category_id']?>" ><?php echo preg_replace('/^\s*(\S)/eu',"mb_strtoupper('\\1', 'UTF-8')", array_search($categorySearchId['category_id'], $categories) );?></option>
            <?php
                }
            ?>
            </select>
            </div>
            <div id="patternHolder" style="width: 430px; height: 90px; margin: 0 auto;" data-colorcount="<?php echo (count($colors) > 7)? 7 : count($colors); ?>">
            <ul id="colorsMatch">
                <?php
                $colorIndexCnt = 0;
                $printedColors = array();
                //var_dump($colors); die();
                    foreach ($colors as $key => $existingColor) {
                    foreach ($pattern as $color) {
                        if($color['id'] == $existingColor['color']) { if(in_array($color['id'], $printedColors)) {continue;}
                ?>
                <li data-colorid="<?php echo $color['id']?>" data-colorindex="<?php echo $colorIndexCnt;?>">
                    <img class="<?php echo ($color['id'] == $colorNum) ? 'activePattern' : 'colorPattern'?>" 
                         src="<?php echo plugin_dir_url( __FILE__ ) . 'images/patterns/' . $color['image']?>" 
                         alt="<?php echo $color['name'];?>" 
                         title="<?php echo $color['name'];?>"
                    />
                </li>
                <?php
                    $colorIndexCnt++;
                    array_push($printedColors, $color['id']);
                        break;}
                    }
                    }
                ?>
            </ul>
            </div>
            <div class="currentPatternName"><span>Текущий цвет: </span><span class="currentPattern"></span></div>
        </div>
        <div class="haveLikedModels" data-likeurl="<?php echo get_option('siteurl').'/'.$catalogPage.'?likeQuery=';?>"><a class="likeLink" href="#">Понравившиеся модели</a></div>
        <ul id="catalogItemList" style="overflow: hidden;">
        <?php
        buildCatalogCategorySet($selectedItems, $colorNum, $newMarkerPlace);
    }
    ?>
        </ul>
    <!--</div>-->

    <?php // Condition for Art series
    if($categoryId == 6) {
        $artPictures = glob(__DIR__.DIRECTORY_SEPARATOR.'images'.DIRECTORY_SEPARATOR.'doors'.DIRECTORY_SEPARATOR.'original'.DIRECTORY_SEPARATOR.'art'.DIRECTORY_SEPARATOR.'*.{jpg,png,gif}', GLOB_BRACE);
        if(!empty($artPictures)) {
            ?><div>
            <ul style="display: none;" class="artSamples" data-pluginurl="<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__));?>" data-picturecount="<?php echo count($artPictures); ?>">
                <?php foreach($artPictures as $picture) {
                        $model = explode('-', basename($picture));
                    ?>
                    <li class="artSample">
                        <img class="pictureArt" data-categoryid="<?php echo $categoryId?>" data-modelprefix="<?php echo ucfirst($prefix[$categoryId]);?>" data-modelname="<?php echo $model[1];?>" src="<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__));?>/images/doors/original/art/<?php echo basename($picture);?>" width="60px" height="110px" alt="" />
                    </li>
                <?php } ?>
            </ul>
            </div>
        <?php
        }
    }
    ?>

<?php
    }
?>
                
<?php 

function buildCatalogCategorySet($items, $color, $newMarkerPlace) {
    if(!empty ($items)) {
    $config = getConfig();
    $categories = $config['category'];
    $pattern = $config['pattern'];
    $prefix = $config['prefix'];
    foreach ($items as $model) { ?>
             <li>
                 <div class="modelTitle">
                    <p>
                     <?php 
                        echo preg_replace('/^\s*(\S)/eu',"mb_strtoupper('\\1', 'UTF-8')",  $prefix[$model['category_id']].'-'. $model['name']);//ucfirst(array_search($model['category_id'], $categories));
                     ?>
                     <?php if((integer)$model['new'] === 1 && ($newMarkerPlace == NEW_MARKER_TITLE || $newMarkerPlace == NEW_MARKER_ALL) ) { ?>
                        <span class="newModel"> <?php echo $config['phrases']['new']; ?> </span>
                     <?php } ?>
                     </p>
                 </div>
                 <div class="itemImage boxgrid captionfull"> <!--  data-modelname="<?php echo $model['name'];?>" style="background-image: url(<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/doors/'.$model['image'] ?>);" -->
                     <img class="modelPicture" data-categoryid="<?php echo $model['category_id']?>" data-modelprefix="<?php echo $prefix[$model['category_id']];?>" data-modelname="<?php echo $model['name'];?>" src="<?php echo get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/doors/small/'.$model['image'] ?>" height="250px" width="125px" alt="" />
                     <?php if((integer)$model['new'] === 1 && ($newMarkerPlace == NEW_MARKER_IMG || $newMarkerPlace == NEW_MARKER_ALL)) { ?>
                         <span class="newModelMarker"><?php echo $config['phrases']['new']; ?></span>
                     <?php } ?>
                     <div class="coverZoom boxcaptionZoom">
                         <span class="zoomModel">
                             Увеличить
                         </span>
                     </div>
                     <div class="cover boxcaption">
                         <span class="roomModel">
                             Комната
                         </span>
                     </div>
                 </div>
                 <div class="likedModel" data-likecategory="<?php echo $model['category_id'];?>" data-likemodel="<?php echo $model['name'];?>" data-likekey="<?php echo $model['category_id'].$model['name'].$color;?>"><?php echo $config['phrases']['like']; //iconv("cp1251", "UTF-8",)?></div>
             </li>
     <?php } ?>
        <input type="hidden" name="newMarkerPlace" value="<?php echo $newMarkerPlace; ?>">
    <?php }
}

add_action('wp_ajax_queryModels', 'queryModels');
add_action('wp_ajax_nopriv_queryModels', 'queryModels');

function queryModels() {
    $condition = 'category_id = ' . $_GET['category'] . ' AND color = ' . $_GET['color'];
    $models = selectCatalogItems(SELECT_MODE_CONDITION, array(), $condition, true);
    ob_clean();
    echo buildCatalogCategorySet($models, $_GET['color'], $_GET['newMarkerPlace']);
    die();
}


add_action('wp_ajax_queryColor', 'queryColor');
add_action('wp_ajax_nopriv_queryColor', 'queryColor');

function queryColor() {
    $condition = 'category_id = "'.$_GET['categoryId'].'" AND name = "' . $_GET['modelName'] . '" AND color = ' . $_GET['color'];
    $models = selectCatalogItems(SELECT_MODE_CONDITION, array(), $condition, true);
    $size = (isset($_GET['small'])) ? 'small' : 'original';
    ob_clean();
    echo json_encode(array('imageSrc' => get_option('siteurl') . '/wp-content/plugins/' . basename(dirname(__FILE__)) . '/images/doors/' . $size . '/' . $models[0]['image'].'?'.uniqid()));
    die();
}

//add_action('wp_ajax_queryModels', 'queryModels');

// this hook is fired if the current viewer is not logged in

?>

<?php
function appendJsCssDoorCatalog() {
    wp_deregister_script( 'jquery' );
    wp_register_script( 'jquery', plugin_dir_url( __FILE__ ).'system/js/jquery1.7.1.js');
    wp_enqueue_script( 'jquery' );
    
    wp_deregister_script( 'jquery-ui' );
    wp_register_script( 'jquery-ui', plugin_dir_url( __FILE__ ).'system/js/jquery-ui-1.8.18.custom.min.js');
    wp_enqueue_script( 'jquery-ui' );
    
    /*wp_deregister_script( 'doorcatalog' );
    wp_register_script( 'doorcatalog', plugin_dir_url( __FILE__ ).'system/js/doorCatalog.js');
    wp_enqueue_script( 'doorcatalog' );*/
    
    // embed the javascript file that makes the AJAX request
    wp_enqueue_script( 'create-ajax-request', plugin_dir_url( __FILE__ ) . 'system/js/doorCatalog.js', array( 'jquery' ) );
    // declare the URL to the file that handles the AJAX request (wp-admin/admin-ajax.php)
    wp_localize_script( 'create-ajax-request', 'ajaxLink', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
    
    wp_deregister_script( 'jquery.bxSlider' );
    wp_register_script( 'jquery.bxSlider', plugin_dir_url( __FILE__ ).'system/js/jquery.bxSlider.js');
    wp_enqueue_script( 'jquery.bxSlider' );
    
    wp_register_style($handle = 'jquery-ui', $src = plugins_url('system/css/jquery-ui-1.8.18.custom.css', __FILE__), $deps = array(), $ver = '1.0.0', $media = 'all');
    wp_enqueue_style('jquery-ui');
    
    wp_register_style($handle = 'doorcatalog', $src = plugins_url('system/css/doorCatalog.css', __FILE__), $deps = array(), $ver = '1.0.0', $media = 'all');
    wp_enqueue_style('doorcatalog');
    
    wp_register_style($handle = 'bx_styles', $src = plugins_url('system/css/bx_styles/bx_styles.css', __FILE__), $deps = array(), $ver = '1.0.0', $media = 'all');
    wp_enqueue_style('bx_styles');
    
}
 
add_action('wp_enqueue_scripts', 'appendJsCssDoorCatalog');

function doorCatalogShortCode($attributes){
    if(!isset($attributes['page'])) { return "<div>Не указана страница для каталога</div>"; }
    $catalogPage = $attributes['page'];
    $catalogFlag = (isset ($attributes['iscatalog']) ) ? $attributes['iscatalog'] : false;
    $newMarkerPlace = (isset($attributes['marker']))? $attributes['marker'] : null;
    ob_start();
    doorCatalog($catalogPage, $catalogFlag, $newMarkerPlace);
    $output_string=ob_get_contents();
    ob_end_clean();
    return $output_string;
}

add_shortcode( 'DoorCatalogPlF', 'doorCatalogShortCode' );

?>