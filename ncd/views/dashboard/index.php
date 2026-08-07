<?php

use app\base\Common;
use app\models\Vformstatus;
use yii\data\ActiveDataProvider;
use yii\data\ArrayDataProvider;
use yii\data\SqlDataProvider;
use yii\db\Query;
use app\models\Users;

$this->title = 'Dashboard\'s';

$today = strtotime(date("Y/m/d"));
$date = strtotime(date("Y/m/d"));

$sloc=Yii::$app->user->identity->signedin_loc;
$suser=Yii::$app->user->identity->users_name;
		
$Usermodel = Users::find()->where(['users_name' => $suser])->one();			   
$UserRole= $Usermodel->user_role;	

$this->title = 'Dashboard\'s';

$dataProvider1 = new SqlDataProvider([
     'sql' => ' SELECT * FROM v_formsummary' ,		 
     'params' => [],
 ]);

$query = Vformstatus::find()->orderBy(["dg_date" => SORT_DESC,"pid" => SORT_DESC]);
$dataProvider2 = new ActiveDataProvider(['query' => $query, 'sort' => false, 'pagination' => ['pagesize' => 50]]); 


?>

<div class="row">
     <div class="col-md-12"><?= $this->render('formsummary', ['dataProvider' => $dataProvider1]); ?></div>  
    <div class="col-md-12"><?= $this->render('formstatus', ['dataProvider' => $dataProvider2]); ?></div>     
    
</div>