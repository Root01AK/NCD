<?php

namespace app\controllers;

use Yii;
use app\base\Model;
use app\models\Locationmapping;
use yii\data\ActiveDataProvider;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;

/**
 * LocationmappingController implements the CRUD actions for Locationmapping model.
 */
class LocationmappingController extends Controller
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
     * Lists all Locationmapping models.
     * @return mixed
     */
    public function actionIndex()
    {
        $dataProvider = new ActiveDataProvider([
			'query' => Locationmapping::find()->groupBy(['loc_mapng_sur_id']),
		]);

        return $this->render('index', [
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Locationmapping model.
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
     * Creates a new Locationmapping model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    /*
    public function actionCreate()
    {
        $model = new Locationmapping();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->loc_mapng_id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }
    */
    
    public function actionCreate()
    {
        $model = new Locationmapping;
        $models = [new Locationmapping];

        if ($model->load(Yii::$app->request->post())) {

            $post = [];
            $formName = $model->formName();
            $formVars = Yii::$app->request->post($formName);
            
            foreach($formVars as $key => $val) {
                if(is_array($val)) :
                    $post[$formName][] = $val;
                    unset($formVars[$key]);
                endif;
            }
            
            $models   = [];
            foreach($post[$formName] as $k => $p) {
                $models[] = new Locationmapping;
                $posts[$formName][$k] = array_merge($p, $formVars);
            }
            
            Model::loadMultiple($models, $posts);
            $valid = Model::validateMultiple($models);

            if ($valid) {
                $transaction = \Yii::$app->db->beginTransaction();

                try {
                    foreach ($models as $modelAddress) {
                        if (! ($flag = $modelAddress->save(false))) {
                            $transaction->rollBack();
                            break;
                        }
                    }

                    if ($flag) {
                        $transaction->commit();
                        Yii::$app->session->setFlash('success', "Records Created Successful");
                        return $this->redirect(['/'.Yii::$app->controller->id]);
                        // return $this->redirect(['view', 'id' => $models[0]->loc_mapng_id]);
                    }
                } catch (Exception $e) {
                    $transaction->rollBack();
                }
            }
        }
        
        return $this->render('create', [
            'model' => $model,
            'models' => (empty($models)) ? [new Locationmapping] : $models,
        ]);
    }

    /**
     * Updates an existing Locationmapping model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    /*
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->loc_mapng_id]);
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
        $models = $this->findModels($id);

        if ($model->load(Yii::$app->request->post())) {

            $post = [];
            $formName = $model->formName();
            $formVars = Yii::$app->request->post($formName);
            
            foreach($formVars as $key => $val) {
                if(is_array($val)) :
                    $post[$formName][] = $val;
                    unset($formVars[$key]);
                endif;
            }
            
            $recmodels = $models;
            $models   = [];
            foreach($post[$formName] as $k => $p) {
                if(empty($p["loc_mapng_id"])) {
                    $models[] = new Locationmapping;
                    $p["create_user"] = $model->create_user;
                    $p["loc_mapng_sur_id"] = $model->loc_mapng_sur_id;
                }
                else
                    $models[] = $this->findModel($p["loc_mapng_id"]);
                $posts[$formName][$k] = array_merge($p, $formVars);
            }
            
            Model::loadMultiple($models, $posts);
            $valid = Model::validateMultiple($models);

            if(count($recmodels) > count($posts[$formName])) {
                $delid = substr(Yii::$app->request->post()[$formName]["delrec"], 0, -1);
                foreach (array_unique(explode(",", $delid)) as $key => $value) {
                    $this->findModel($value)->delete();
                }
            }

            if ($valid) {
                $transaction = \Yii::$app->db->beginTransaction();

                try {
                    foreach ($models as $modelAddress) {
                        if (! ($flag = $modelAddress->save(false))) {
                            $transaction->rollBack();
                            break;
                        }
                    }

                    if ($flag) {
                        $transaction->commit();
                        Yii::$app->session->setFlash('success', "Records Updated Successful");
                        return $this->redirect(['/'.Yii::$app->controller->id]);
                        // return $this->redirect(['view', 'id' => $models[0]->loc_mapng_id]);
                    }
                } catch (Exception $e) {
                    $transaction->rollBack();
                }
            }
        }
        
        return $this->render('update', [
            'model' => $model,
            'models' => (empty($models)) ? [new Locationmapping] : $models,
        ]);
    }

    /**
     * Deletes an existing Locationmapping model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        // $this->findModel($id)->delete();
        $model = $this->findModel($id);
        $sur_id = $model->loc_mapng_sur_id;
        Locationmapping::deleteAll(['loc_mapng_sur_id' => $sur_id]);
        Yii::$app->session->setFlash('success', "Selected Record Deleted Successful");

        return $this->redirect(['/'.Yii::$app->controller->id]);
    }

    /**
     * Finds the Locationmapping model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Locationmapping the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Locationmapping::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    protected function findModels($id)
    {
        $model = Locationmapping::findOne($id);
        $sur_id = $model->loc_mapng_sur_id;

        if (($models = Locationmapping::find()->where(['loc_mapng_sur_id' => $sur_id])->all()) !== null) {
            return $models;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
