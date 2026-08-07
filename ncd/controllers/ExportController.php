<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use app\models\ImportForm;
use app\models\DynamicModel;
use app\models\Users;
use yii\helpers\ArrayHelper;
use app\models\Userrole;

/**
 * ExportController implements the CRUD actions for Export model.
 */
class ExportController extends Controller
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
     * Lists all Arvmaster models.
     * @return mixed
     */
    public function actionIndex()
    {
        $model = new ImportForm();
        $fields = ['mortality_form_q3','track_form_q1','record_date','dg_date','apm_date','mdhl_date','cml_date','cprca_date','bsr_date','ce_date','vital_date','fupm_date','cml_q4_date','fupm_fupdate1','fupm_fupdate2','fupm_fupdate3','visit_date','cml_q47_date'];

        if($model->load(Yii::$app->request->post())) {
            try {
                $Models = new DynamicModel();
                $Models->setTableName($model->name);
				
				$sloc=Yii::$app->user->identity->signedin_loc;
				$suser=Yii::$app->user->identity->users_name;
				
				$Usermodel = Users::find()->where(['users_name' => $suser])->one();			   
			    $UserRole= $Usermodel->user_role;
				
			    $Locs = ArrayHelper::map(Userrole::find()->where(["user_id" => $Usermodel->usr_id])->asArray()->all(), 'authorized_loc', 'authorized_loc');
                $loc = "'" . implode($Locs, "','") . "'";
               
               /*			   
                if($UserRole == 1) 			
				  $allModels = $Models::find()->all();
			    else
				 $allModels = $Models::find()->where(["loc_code"=>$sloc])->all();	
			   */
			     if($UserRole == 1)
				   $allModels = $Models::find()->all();
				 elseif($UserRole == 2) 
				   $allModels = $Models::find()->where("loc_code IN ($loc)")->all();
				 elseif($UserRole == 3) 
				   $allModels = $Models::find()->where(["loc_code"=>$sloc])->all();     
				
                $fileName = str_replace("cms_", "", $Models::getTableSchema()->name);
                $columns = $Models::getTableSchema()->getColumnNames();
                foreach ($columns as $key => $value) {
                    // if($value == "record_date") {
                    //     unset($columns[$key]);
                    // }
                    if(in_array($value, $fields))
                        $columns[$key] = $value.":date";
                    if($value == "create_time" || $value == "update_time" || $value == "visit_in" || $value == "visit_out")
                        $columns[$key] = $value.":datetime";

                    $headers[$value] = $value;
                }

                if($model->type != "") {
                    if($model->type == "xls")
                        $format = "Excel5";
                    elseif($model->type == "xlsx")
                        $format = "Excel2007";
                    elseif($model->type == "csv")
                        $format = "CSV";
                    $fileName .= ".".$model->type;
                }
                else {
                    $fileName .= ".xls";
                    $format = "Excel5";
                }
                // print_r($columns);
                // exit;

                \moonland\phpexcel\Excel::widget([
                    'models' => $allModels,
                    'fileName' => $fileName,
                    'mode' => 'export', //default value as 'export'
                    'format' => $format,
                    'columns' => $columns, 
                    'headers' => $headers, 
                ]);
                Yii::$app->session->setFlash('success', "Data Imported Successful");
                return $this->redirect(['/'.Yii::$app->controller->id]);
            } catch(Exception $error) {
                print_r($error);
            }
        }
        return $this->render('index', ['model' => $model]);
    }

}
