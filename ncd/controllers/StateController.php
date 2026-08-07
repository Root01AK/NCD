<?php

namespace app\controllers;

use Yii;
use app\models\State;
use app\models\Activelog;
use yii\data\ActiveDataProvider;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use yii\web\Response;
use app\models\StateSearch;

/**
 * StateController implements the CRUD actions for State model.
 */
class StateController extends Controller
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
                        'actions' => ['index', 'create', 'update', 'view', 'delete'],
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
     * Lists all State models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new StateSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single State model.
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
     * Creates a new State model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new State();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->st_id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing State model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
		$attr = $model->getOldAttributes();
		$oldmodel = $this->findModel($id);
		$changes = "";

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
			
			// foreach ($model->attributes as $name => $value) {
			// 	if (!empty($attr)) {
			// 		$old = $attr[$name];
			// 	} else {
			// 		$old = '';
			// 	}

			// 	if ($value != $old) {
			// 		echo $changes .= $name . ' from '.$old.' -> '.$value.', ';
			// 	}
			// }
			
			// // echo $msg =  'User ' . Yii::$app->user->identity->id . ' changed ' . trim(substr($changes, 0, -2)) . ' for ' . $model->tableSchema->name;
			// echo $msg =  trim(substr($changes, 0, -2));
			
			// // print_r(Yii::$app->user->identity->users_name);
			// echo "<br>";
			// print_r($model->attributes);
			// echo "<br>";
			// print_r($oldmodel->attributes);
			// echo "<br>";
			// print_r($attr);
			// echo "<br>";
			// echo "<br>";
			// print_r(json_encode($model->attributes));
			// echo "<br>";
			// print_r(json_encode($oldmodel->attributes));
			// exit;
			
            return $this->redirect(['view', 'id' => $model->st_id]);
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing State model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
       // $this->findModel($id)->delete();
	   
	    $model = $this->findModel($id);			
        $model->status=0;
		$model->save(false);
        //print_r($model->getErrors());

        return $this->redirect(['/'.Yii::$app->controller->id]);
    }

    /**
     * Finds the State model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return State the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = State::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
