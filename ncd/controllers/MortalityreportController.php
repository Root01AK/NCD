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
use app\models\Mortalityform;
use app\models\Mortalityreport;
use app\models\Users;

/**
 * MortalityreportController implements the CRUD actions for Patientcrosstabreport model.
 */
class MortalityreportController extends Controller
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
        $model = new Mortalityreport();

        if ($model->load(Yii::$app->request->post())) {
            if (Yii::$app->request->isAjax) {
                Yii::$app->response->format = Response::FORMAT_JSON;
                return ActiveForm::validate($model);
            }
            
            if(!$model->validate()) {
                return $this->render('index', ['model' => $model]);
            } else {
                $CModel = new Mortalityform;
				// $services = array_merge($CModel->q1, $CModel->q2);
                //$services = $CModel->q2;	
				
							
               
                $mortalitytable = Mortalityform::tableName();             
                            
              $model->frmdate = Converter::toUnixTimeformat($model->frmdate);
              $model->todate = Converter::toUnixTimeformat($model->todate);
			  
 			  $sloc=Yii::$app->user->identity->signedin_loc;
			  $suser=Yii::$app->user->identity->users_name;
				
			  $Usermodel = Users::find()->where(['users_name' => $suser])->one();			   
			  $UserRole= $Usermodel->user_role;
                
		     if($UserRole == 1) { 
              if($model->loc != "")	
               	$qry = "SELECT  mortality_form_part_id,IF(FIND_IN_SET(1,mortality_form_q1)>0,1,0) as mortality_form_q1a,IF(FIND_IN_SET(2,mortality_form_q1)>0,1,0) as mortality_form_q1b,
				IF(FIND_IN_SET(3,mortality_form_q1)>0,1,0) as mortality_form_q1c,IF(FIND_IN_SET(4,mortality_form_q1)>0,1,0) as mortality_form_q1d,
				IF(FIND_IN_SET(5,mortality_form_q1)>0,1,0) as mortality_form_q1e,IF(FIND_IN_SET(6,mortality_form_q1)>0,1,0) as mortality_form_q1f,IF(FIND_IN_SET(1,mortality_form_q2)>0,1,0) as mortality_form_q2a,
				IF(FIND_IN_SET(2,mortality_form_q2)>0,1,0) as mortality_form_q2b,IF(FIND_IN_SET(3,mortality_form_q2)>0,1,0) as mortality_form_q2c,
				IF(FIND_IN_SET(4,mortality_form_q2)>0,1,0) as mortality_form_q2d,IF(FIND_IN_SET(5,mortality_form_q2)>0,1,0) as mortality_form_q2e,IF(FIND_IN_SET(6,mortality_form_q2)>0,1,0) as mortality_form_q2f,mortality_form_q3,mortality_form_q4,
					$mortalitytable.status,$mortalitytable.create_time,$mortalitytable.create_user,$mortalitytable.update_time,$mortalitytable.update_user,$mortalitytable.record_date                    
                FROM $mortalitytable                    
                WHERE $mortalitytable.loc_code ='".$model->loc."' and $mortalitytable.record_date BETWEEN '".$model->frmdate."' AND '".$model->todate."' ORDER BY $mortalitytable.record_date";
			 else
				$qry = "SELECT  mortality_form_part_id,IF(FIND_IN_SET(1,mortality_form_q1)>0,1,0) as mortality_form_q1a,IF(FIND_IN_SET(2,mortality_form_q1)>0,1,0) as mortality_form_q1b,
				IF(FIND_IN_SET(3,mortality_form_q1)>0,1,0) as mortality_form_q1c,IF(FIND_IN_SET(4,mortality_form_q1)>0,1,0) as mortality_form_q1d,
				IF(FIND_IN_SET(5,mortality_form_q1)>0,1,0) as mortality_form_q1e,IF(FIND_IN_SET(6,mortality_form_q1)>0,1,0) as mortality_form_q1f,IF(FIND_IN_SET(1,mortality_form_q2)>0,1,0) as mortality_form_q2a,
				IF(FIND_IN_SET(2,mortality_form_q2)>0,1,0) as mortality_form_q2b,IF(FIND_IN_SET(3,mortality_form_q2)>0,1,0) as mortality_form_q2c,
				IF(FIND_IN_SET(4,mortality_form_q2)>0,1,0) as mortality_form_q2d,IF(FIND_IN_SET(5,mortality_form_q2)>0,1,0) as mortality_form_q2e,IF(FIND_IN_SET(6,mortality_form_q2)>0,1,0) as mortality_form_q2f,mortality_form_q3,mortality_form_q4,
					$mortalitytable.status,$mortalitytable.create_time,$mortalitytable.create_user,$mortalitytable.update_time,$mortalitytable.update_user,$mortalitytable.record_date                    
                FROM $mortalitytable                    
                WHERE $mortalitytable.record_date BETWEEN '".$model->frmdate."' AND '".$model->todate."' ORDER BY $mortalitytable.record_date";
			 }
			else
              	$qry = "SELECT  mortality_form_part_id,IF(FIND_IN_SET(1,mortality_form_q1)>0,1,0) as mortality_form_q1a,IF(FIND_IN_SET(2,mortality_form_q1)>0,1,0) as mortality_form_q1b,
				IF(FIND_IN_SET(3,mortality_form_q1)>0,1,0) as mortality_form_q1c,IF(FIND_IN_SET(4,mortality_form_q1)>0,1,0) as mortality_form_q1d,
				IF(FIND_IN_SET(5,mortality_form_q1)>0,1,0) as mortality_form_q1e,IF(FIND_IN_SET(6,mortality_form_q1)>0,1,0) as mortality_form_q1f,IF(FIND_IN_SET(1,mortality_form_q2)>0,1,0) as mortality_form_q2a,
				IF(FIND_IN_SET(2,mortality_form_q2)>0,1,0) as mortality_form_q2b,IF(FIND_IN_SET(3,mortality_form_q2)>0,1,0) as mortality_form_q2c,
				IF(FIND_IN_SET(4,mortality_form_q2)>0,1,0) as mortality_form_q2d,IF(FIND_IN_SET(5,mortality_form_q2)>0,1,0) as mortality_form_q2e,IF(FIND_IN_SET(6,mortality_form_q2)>0,1,0) as mortality_form_q2f,mortality_form_q3,mortality_form_q4,
					$mortalitytable.status,$mortalitytable.create_time,$mortalitytable.create_user,$mortalitytable.update_time,$mortalitytable.update_user,$mortalitytable.record_date                    
                FROM $mortalitytable                    
                WHERE $mortalitytable.loc_code ='".$sloc."' and $mortalitytable.record_date BETWEEN '".$model->frmdate."' AND '".$model->todate."' ORDER BY $mortalitytable.record_date";
				
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
