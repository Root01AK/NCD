<?php

namespace app\controllers;

use Yii;
use yii\web\Response;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\widgets\ActiveForm;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use yii\data\ArrayDataProvider;
use app\base\Converter;
use app\models\Trackingform;
use app\models\Trackingreport;
use app\models\Users;

/**
 * TrackingreportController implements the CRUD actions for Patientcrosstabreport model.
 */
class TrackingreportController extends Controller
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'actions' => ['error'],
                        'allow' => true,
                    ],
                    [
                        'actions' => ['index'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['POST'],
                ],
            ],
        ];
    }
			
	
		 
    /**
     * Lists all models.
     * @return mixed
     */
    public function actionIndex()
    {
        $model = new Trackingreport();

        if ($model->load(Yii::$app->request->post()) || $model->load(Yii::$app->request->get())) {
            
            if(!$model->validate()) {
                return $this->render('index', ['model' => $model]);
            } else {
                $CModel = new Trackingform;
				// $services = array_merge($CModel->q1, $CModel->q2);
                //$services = $CModel->q2;	
				
              $trackingtable = Trackingform::tableName();             
                            
              $model->frmdate = Converter::toUnixTimeformat($model->frmdate);
              $model->todate = Converter::toUnixTimeformat($model->todate);
              
			  $sloc=Yii::$app->user->identity->signedin_loc;
			  $suser=Yii::$app->user->identity->users_name;
				
			  $Usermodel = Users::find()->where(['users_name' => $suser])->one();			   
			  $UserRole= $Usermodel->user_role;
                
			if($UserRole == 1) {
              if($model->loc != "")	
				$qry = "SELECT Distinct track_form_part_id,track_form_q1,IF(FIND_IN_SET(1,track_form_q2)>0,1,0) as track_form_q2a,IF(FIND_IN_SET(2,track_form_q2)>0,1,0) as track_form_q2b,
				IF(FIND_IN_SET(3,track_form_q2)>0,1,0) as track_form_q2c,IF(FIND_IN_SET(4,track_form_q2)>0,1,0) as track_form_q2d,
				IF(FIND_IN_SET(5,track_form_q2)>0,1,0) as track_form_q2e,IF(FIND_IN_SET(1,track_form_q3)>0,1,0) as track_form_q3a,
				IF(FIND_IN_SET(2,track_form_q3)>0,1,0) as track_form_q3b,IF(FIND_IN_SET(3,track_form_q3)>0,1,0) as track_form_q3c,
				IF(FIND_IN_SET(4,track_form_q3)>0,1,0) as track_form_q3d,IF(FIND_IN_SET(5,track_form_q3)>0,1,0) as track_form_q3e,track_form_q4,track_form_q5,
					$trackingtable.status,$trackingtable.create_time,$trackingtable.create_user,$trackingtable.update_time,$trackingtable.update_user,$trackingtable.record_date                    
                FROM $trackingtable                    
                WHERE $trackingtable.loc_code ='".$model->loc."' and $trackingtable.record_date BETWEEN '".$model->frmdate."' AND '".$model->todate."' ORDER BY $trackingtable.record_date";				  
               else				  
				$qry = "SELECT Distinct track_form_part_id,track_form_q1,IF(FIND_IN_SET(1,track_form_q2)>0,1,0) as track_form_q2a,IF(FIND_IN_SET(2,track_form_q2)>0,1,0) as track_form_q2b,
				IF(FIND_IN_SET(3,track_form_q2)>0,1,0) as track_form_q2c,IF(FIND_IN_SET(4,track_form_q2)>0,1,0) as track_form_q2d,
				IF(FIND_IN_SET(5,track_form_q2)>0,1,0) as track_form_q2e,IF(FIND_IN_SET(1,track_form_q3)>0,1,0) as track_form_q3a,
				IF(FIND_IN_SET(2,track_form_q3)>0,1,0) as track_form_q3b,IF(FIND_IN_SET(3,track_form_q3)>0,1,0) as track_form_q3c,
				IF(FIND_IN_SET(4,track_form_q3)>0,1,0) as track_form_q3d,IF(FIND_IN_SET(5,track_form_q3)>0,1,0) as track_form_q3e,track_form_q4,track_form_q5,
					$trackingtable.status,$trackingtable.create_time,$trackingtable.create_user,$trackingtable.update_time,$trackingtable.update_user,$trackingtable.record_date                    
                FROM $trackingtable                    
                WHERE $trackingtable.record_date BETWEEN '".$model->frmdate."' AND '".$model->todate."' ORDER BY $trackingtable.record_date";
		    }
			else
				$qry = "SELECT Distinct track_form_part_id,track_form_q1,IF(FIND_IN_SET(1,track_form_q2)>0,1,0) as track_form_q2a,IF(FIND_IN_SET(2,track_form_q2)>0,1,0) as track_form_q2b,
				IF(FIND_IN_SET(3,track_form_q2)>0,1,0) as track_form_q2c,IF(FIND_IN_SET(4,track_form_q2)>0,1,0) as track_form_q2d,
				IF(FIND_IN_SET(5,track_form_q2)>0,1,0) as track_form_q2e,IF(FIND_IN_SET(1,track_form_q3)>0,1,0) as track_form_q3a,
				IF(FIND_IN_SET(2,track_form_q3)>0,1,0) as track_form_q3b,IF(FIND_IN_SET(3,track_form_q3)>0,1,0) as track_form_q3c,
				IF(FIND_IN_SET(4,track_form_q3)>0,1,0) as track_form_q3d,IF(FIND_IN_SET(5,track_form_q3)>0,1,0) as track_form_q3e,track_form_q4,track_form_q5,
					$trackingtable.status,$trackingtable.create_time,$trackingtable.create_user,$trackingtable.update_time,$trackingtable.update_user,$trackingtable.record_date                    
                FROM $trackingtable                    
                WHERE $trackingtable.loc_code ='".$sloc."' and $trackingtable.record_date BETWEEN '".$model->frmdate."' AND '".$model->todate."' ORDER BY $trackingtable.record_date";
				
                $QModel = Yii::$app->db->createCommand($qry)->queryAll();              
                $nmodel = [];
				$services=[];
                foreach ($QModel as $key => $value) {
                    foreach ($services as $skey => $svalue) {
                        $nservices[$svalue] = '-';
                    }                   
					
                    $xservices = [];
                    $index = 0;
                    foreach ($value as $key1 => $value1) {
                        $xservices[] = $value1;                        
                    }
                    
                    $nmodel[] = $xservices;
                   
                }

                $dataProvider = new ArrayDataProvider([
                    'allModels' => $nmodel,
                    'pagination' => false
                ]);
                
                $model->frmdate = Converter::toDisplay($model->frmdate);
                $model->todate = Converter::toDisplay($model->todate);
               
                return $this->render('index', ['model' => $model, 'dataProvider' => $dataProvider]);
            }
        }
        return $this->render('index', ['model' => $model]);
    }

}
