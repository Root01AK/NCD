<?php

namespace app\controllers;

use Yii;
use app\models\Users;
use app\models\UsersSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use app\models\Userrole;
use app\models\Staff;

/**
 * UsersController implements the CRUD actions for Users model.
 */
class UsersController extends Controller
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
                        'actions' => ['index', 'create', 'update', 'view', 'delete','staff'],
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
     * Lists all Users models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new UsersSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Users model.
     * @param integer $id
     * @return mixed
     */
    public function actionView($id)
    {
        return $this->render('view', [
            'model' => $this->findModel($id),
        ]);
    }

    /**
     * Creates a new Users model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
  /*
    public function actionCreate()
    {
        $model = new Users();
        $model->scenario = "create";

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->usr_id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }
  */
	public function actionCreate()
    {
        $model = new Users();
		$model->scenario = "create";

        if ($model->load(Yii::$app->request->post())) {           
                if($model->loc_code != "")
                    $model->loc_code = implode(",", $model->loc_code);
				
           if($model->save()) {
		    if($model->loc_code != "")
			// print_r ($model->loc_code);
		   //  exit;
             $locs = explode(",", $model->loc_code);
		  
		   foreach($locs as $val) {
			  $Rmodel = new Userrole;	
			  $Rmodel->user_id = $model->usr_id;
			  $Rmodel->authorized_loc = $val;	
			  $Rmodel->status=1;
		      $Rmodel->create_time=$model->create_time;
			  $Rmodel->create_user=$model->create_user;
			  $Rmodel->update_time=$model->update_time;
			  $Rmodel->record_date=$model->record_date;
			  
			  $Rmodel->save(false);
		    }
                return $this->redirect(['view', 'id' => $model->usr_id]);
		   }
		   
            else {              
                    if($model->loc_code != "")
                        $model->loc_code = explode(",", $model->loc_code);
                    
                return $this->render('create', ['model' => $model]);
            }
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Users model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
   

  /*	 
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
        $model->scenario = "update";
        unset($model->password);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->usr_id]);
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }
  */
  
   public function actionUpdate($id)
    {
        $model = $this->findModel($id);
		$model->scenario = "update";
        unset($model->password);

        if ($model->load(Yii::$app->request->post())) {
          
                if($model->loc_code != "")
                    $model->loc_code = implode(",", $model->loc_code);               
          
            if($model->save()) {				
			if (($Umodel = Userrole::find()->where(['user_id' => $id])->one()) !== null) {		
           	    Userrole::deleteAll(['user_id' => $id]);
            }
			
			if($model->loc_code != "")		
             $locs = explode(",", $model->loc_code);
		  
		   foreach($locs as $val) {
			  $Rmodel = new Userrole;	
			  $Rmodel->user_id = $model->usr_id;
			  $Rmodel->authorized_loc = $val;	
			  $Rmodel->status=1;
		      $Rmodel->create_time=$model->create_time;
			  $Rmodel->create_user=$model->create_user;
			  $Rmodel->update_time=$model->update_time;
			  $Rmodel->record_date=$model->record_date;
			  
			  $Rmodel->save(false);
		    }
			
                return $this->redirect(['view', 'id' => $model->usr_id]);
		    }
			
            else {            
                    if($model->loc_code != "")
                        $model->loc_code = explode(",", $model->loc_code);
                                   
                return $this->render('update', ['model' => $model]);
            }
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }
	
    /**
     * Deletes an existing Users model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        return $this->redirect(['/'.Yii::$app->controller->id]);
    }

    /**
     * Finds the Users model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Users the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Users::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
	
	
	   public function actionStaff()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        $request = Yii::$app->request;
        if ($request->isGet)
            $id = $request->get('uid');
        if ($request->isPost)
            $id = $request->post('uid');
	  
        $model = Staff::find()->where(["staffcode" => $id])->one();
        if ($model !== null) {		
         return $model;
        } 
    }	 
	
}
