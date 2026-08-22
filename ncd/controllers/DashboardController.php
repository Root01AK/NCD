<?php

namespace app\controllers;

use Yii;
use app\base\Common;
use yii\web\Controller;
use yii\web\UploadedFile;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use app\models\Applicationsettings;
use app\models\Attandance;
use app\models\AttandanceSearch;
use app\models\LoginForm;
use app\models\ContactForm;
use app\models\ImportForm;
use app\base\Converter;
use yii\data\ActiveDataProvider;
use ruskid\csvimporter\CSVReader;
use ruskid\csvimporter\CSVImporter;
use app\models\Mdhl;

class DashboardController extends Controller
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::class,
                'rules' => [
                    [
                        'actions' => ['error', 'resetdatabase'],
                        'allow' => true,
                    ],
                    [
                        'actions' => ['index', 'hivpos','notscreened','screeninglist','eligiblelist','noteligiblelist','enrolledlist','notenrolledlist','unlinkedlist','preartonlylist','artlist','getloc','getids','hivlinkagelist', 'resetdatabase'],
                        'allow' => true,
                        'roles' => ['@', '?'],
                    ],
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::class,
                'actions' => [
                    'logout' => ['post'],
                ],
            ],
        ];
    }

    /**
     * Displays homepage.
     *
     * @return string
     */
    public function actionIndex()
    {
        return $this->render('index');
    }
     public function actionNotscreened()
    {
       	return "Please do screening for this participant immediately";
	}
	
	public function actionScreeninglist()
    {
	  $query = Mdhl::find()->orderBy(["mem_scrn_part_id" => SORT_ASC]);
	   // $scrtable = Screening::tableName();
	   
	 // $query = Mdhl::find()->where("mem_scrn_q24=2 and (mem_scrn_q26=2 or mem_scrn_q26 is null or mem_scrn_q26=1)")->orWhere("mem_scrn_q24=1")->orderBy(["mem_scrn_part_id" => SORT_ASC]);
		
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('screeninglist', ['dataProvider' => $dataProvider, 'all' => true]);
	}
	
	public function actionEligiblelist()
    {
	   $query = Mdhl::find()->Where('mem_scrn_q24=1')->orderBy(["mem_scrn_part_id" => SORT_ASC]);
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('eligiblelist', ['dataProvider' => $dataProvider, 'all' => true]);
	}
	
	public function actionNoteligiblelist()
    {
	   $query = Mdhl::find()->Where('mem_scrn_q24=2')->orderBy(["mem_scrn_part_id" => SORT_ASC]);
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('noteligiblelist', ['dataProvider' => $dataProvider, 'all' => true]);
	}
	
	public function actionEnrolledlist()
    {
	   $query = Mdhl::find()->Where('mem_scrn_q25=1')->orderBy(["mem_scrn_part_id" => SORT_ASC]);
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('enrolledlist', ['dataProvider' => $dataProvider, 'all' => true]);
	}
	
	public function actionNotenrolledlist()
    {
	   $query = Mdhl::find()->Where('mem_scrn_q25=2')->orderBy(["mem_scrn_part_id" => SORT_ASC]);
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('notenrolledlist', ['dataProvider' => $dataProvider, 'all' => true]);
	}
	
		public function actionUnlinkedlist()
    {
	   $query = Mdhl::find()->Where('mem_scrn_q25=1')->andWhere('mem_scrn_q16 ="" or mem_scrn_q16 is null')->andWhere('mem_scrn_q19 ="" or mem_scrn_q19 is null')->orderBy(["mem_scrn_part_id" => SORT_ASC]);
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('unlinkedlist', ['dataProvider' => $dataProvider, 'all' => true]);
	}
	
	public function actionPreartonlylist()
    {
	   $query = Mdhl::find()->Where('mem_scrn_q25=1')->andWhere('mem_scrn_q16 !=""')->andWhere('mem_scrn_q19 ="" or mem_scrn_q19 is null' )->orderBy(["mem_scrn_part_id" => SORT_ASC]);
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('preartonlylist', ['dataProvider' => $dataProvider, 'all' => true]);
	}	
		
	public function actionArtlist()
    {
	   $query = Mdhl::find()->Where('mem_scrn_q25=1')->andWhere('mem_scrn_q19 !=""')->orderBy(["mem_scrn_part_id" => SORT_ASC]);
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('artlist', ['dataProvider' => $dataProvider, 'all' => true]);
	}
	

    public function actionHivpos()
    {
        $request = Yii::$app->request;
        if ($request->isGet)
            $pid = $request->get('pid');
        if ($request->isPost)
            $pid = $request->post('pid');

        // $query = Registration::find()->where("corfrm_pid IN (SELECT pid FROM $attntable WHERE visit_date between $date AND ".date('U'). " And out_interviewer IS NULL AND visit_out IS NULL)")->orderBy(["corfrm_pid" => SORT_ASC]);
        //$query = Attandance::find()->with("cd4")->innerJoinWith("registration")->where(["corfrm_pid" => $pid])->andWhere(["IS", "out_interviewer", NULL])->orderBy(["corfrm_pid" => SORT_ASC]);
		
		$today = strtotime(date("Y/m/d"));
		$query = Attandance::find()->with("cd4")->innerJoinWith("registration")->where(["corfrm_pid" => $pid])->andWhere(["visit_date" => $today])->orderBy(["corfrm_pid" => SORT_ASC]);
		$dataProvider = new ActiveDataProvider(['query' => $query, 'sort' => false]);
        $data = $dataProvider->getModels()[0]->registration->attributes;

        if($data["corfrm_q12"] == 1 || $data["corfrm_q12"] == 9) {
            $Models = $query->one();

            $artdate = $Models->registration->getLastvisit("artdate");
            $hivlinkstatus = $Models->registration->getHivlinkage();

            if($hivlinkstatus != "-") {
                if($hivlinkstatus == "On ART") {
                    $chkdate = "35 Days";
                } elseif($hivlinkstatus == "Pre-ART") {
                    $chkdate = "180 Days";
                }
            }

            $hivcoundate = $Models->registration->getCounselingDate();
            $hivcounnxtdate = "-";
            if($hivcoundate != "-")
                $hivcounnxtdate = Converter::toDisplay(strtotime("90 Days", Converter::toStore($hivcoundate)));

            $hivvisitdate = $Models->registration->getLastvisit($Models->record_date);
            $hivvisitnxtdate = "";
            if($artdate != "-" && $hivlinkstatus == "Not linked")
                $hivvisitnxtdate = "Refer to the Government Center";
            if($artdate != "-" && $hivlinkstatus == "On ART")
                $hivvisitnxtdate = $Models->registration->getLastvisit("nextvisit");
            if($artdate != "-" && $hivlinkstatus == "Pre-ART")
                $hivvisitnxtdate = Converter::toDisplay(strtotime("180 Days", Converter::toStore($hivvisitdate)));

            $Services = [];
            // $Service["service"] = "Client ID";
            // $Service["value1"] = $Models->registration->corfrm_pid;
            // $Service["value2"] = "";
            // $Services[] = $Service;
			$Service["service"] = "Age";
            $Service["value1"] = $Models->registration->corfrm_q4;
            $Service["value2"] = "";
            $Services[] = $Service;
			$Service["service"] = "Gender";
            $Service["value1"] = $Models->registration->getClientSex();
            $Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "HIV Status";
            $Service["value1"] = $Models->registration->getClientHIVStatus();
            $Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "OST";
            $Service["value1"] = $Models->registration->getOST();
            $Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "HIV Linkage";
            $Service["value1"] = $hivlinkstatus;
            $Service["value2"] = "";
            $Services[] = $Service;			
			$Service["service"] = "Pre-ART Registration No";           
            $Service["value1"] = $Models->registration->getHivlinkageDetails("preart");
			$Service["value2"] = "";
			$Services[] = $Service;
			$Service["service"] = "Pre-ART Registration Date";           
            $Service["value1"] = $Models->registration->getHivlinkageDetails("preartdate");
			$Service["value2"] = "";
			$Services[] = $Service;
			$Service["service"] = "ART Registration No";           
            $Service["value1"] = $Models->registration->getHivlinkageDetails("art");
			$Service["value2"] = "";
			$Services[] = $Service;
			$Service["service"] = "ART Registration Date";           
            $Service["value1"] = $Models->registration->getHivlinkageDetails("artdate");
			$Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "ART Book Check Date";
            $Service["value1"] = $artdate;
            $Service["value2"] = ($artdate != "-" && $hivlinkstatus != "Unlinked") ? Converter::toDisplay(strtotime($chkdate, Converter::toStore($artdate))) : "";
            $Services[] = $Service;
            $Service["service"] = "HIV Visit Date";
            $Service["value1"] = $hivvisitdate;
            $Service["value2"] = $hivvisitnxtdate;
            $Services[] = $Service;
            $Service["service"] = "ARV Dispensed";
            $Service["value1"] = $Models->registration->getLastvisit("arvstatus");
            $Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "ARV Pills";
            $Service["value1"] = $Models->registration->getLastvisit("arvdata");
            $Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "ARV Pills Qty";
            $Service["value1"] = $Models->registration->getLastvisit("arvdataqty");
            $Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "CD4 Date";
            $Service["value1"] = (isset($Models->cd4)) ? $Models->cd4->getDate() : "-";
            $Service["value2"] = (isset($Models->cd4)) ? $Models->cd4->getNextDate() : "-";
            $Services[] = $Service;
            $Service["service"] = "CD4 Value";
            $Service["value1"] = (isset($Models->cd4)) ? $Models->cd4->cd4_test_q4 : "-";
            $Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "HIV Motivational Counseling Date";
            $Service["value1"] = $hivcoundate;
            $Service["value2"] = $hivcounnxtdate;
            $Services[] = $Service;
            $Service["service"] = "Cohort";
            $Service["value1"] = $Models->registration->getOncohort();
            $Service["value2"] = "";
            $Services[] = $Service;
            $Service["service"] = "Incentives";
            $Service["value1"] = $Models->registration->getOncohort("incentives");
            $Service["value2"] = "";
            $Services[] = $Service;

            $provider = new \yii\data\ArrayDataProvider([
                'allModels' => $Services,
                'pagination' => [
                    'pageSize' => 50
                ],
            ]);
            $layouttitle = $Models->registration->corfrm_q1." (".$Models->registration->corfrm_pid.")";

            return $this->renderPartial('hivpos', ['dataProvider' => $provider, 'all' => true, 'view' => 'vertical', 'layouttitle' => $layouttitle]);
            // $dataProvider = $query->one();
            // return $this->renderPartial('hivpos', ['dataProvider' => $dataProvider, 'all' => true, 'view' => 'vertical']);
        } elseif($data["corfrm_q12"] == 0) {
            return $this->renderPartial('hivneg', ['dataProvider' => $dataProvider, 'all' => true]);
        } else
            return $this->renderPartial('hivind', ['dataProvider' => $dataProvider, 'all' => true]);
    }

    public function actionGetloc()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        $request = Yii::$app->request;
        if ($request->isGet)
            $id = $request->get('depdrop_parents');
        if ($request->isPost)
            $id = $request->post('depdrop_parents');

        $AppSettings = Applicationsettings::find()->where(["app_survey_id" => $id[0]])->orderBy(["app_stngs_id" => SORT_ASC])->one();
        if($AppSettings !== null)
            $selected = $AppSettings->app_location;
        else
            $selected = "";
        $model = Common::getSurlocations($id[0]);
        $arr = [];
        $index = 0;
        foreach ($model as $key => $value) {
            $arr[$index]['id'] = (string)$key;
            $arr[$index]['name'] = (string)$value;
            $index++;
        }
        return ['output' => $arr, 'selected' => $selected];
    }

    public function actionGetids()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        $request = Yii::$app->request;
        if ($request->isGet) {
            $parents = $request->get('depdrop_parents');
            $params = $request->get('depdrop_params');
        }
        if ($request->isPost) {
            $parents = $request->post('depdrop_parents');
            $params = $request->post('depdrop_params');
        }

        if(isset($params) && !empty($params[0])) {
            $methodName = $params[0];
            if(empty($params[1]))
                $model = Common::{$methodName}($parents[0], $parents[1]);
            elseif(!empty($params[1]) && !isset($parents[2]))
                $model = Common::{$methodName}($params[1], $parents[0], $parents[1]);
            else
                $model = Common::{$methodName}($parents[0], $parents[1], $params[1]);
            $arr = [];
            $index = 0;
            foreach ($model as $key => $value) {
                $arr[$index]['id'] = (string)$key;
                $arr[$index]['name'] = (string)$value;
                $index++;
            }
            return ['output' => $arr];
        } else {
            // return ['output' => []];
        }
    }
	
	public function actionHivlinkagelist()
    {
		$scrtable = Mdhl::tableName();
		$query = Mdhl::find()->orderBy(["mem_scrn_part_id" => SORT_ASC]);	 
       $dataProvider = new ActiveDataProvider(['query' => $query,'pagination' => false]);
       return $this->renderPartial('hivlinkagelist', ['dataProvider' => $dataProvider, 'all' => true]);
	}

    public function actionResetdatabase()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        Yii::$app->response->headers->set('Access-Control-Allow-Origin', '*');
        Yii::$app->response->headers->set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        Yii::$app->response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        $tables = [
            'cms_mdhl',
            'cms_apm',
            'cms_bsr',
            'cms_ce',
            'cms_cml',
            'cms_cprca',
            'cms_dg',
            'cms_fupm',
            'cms_mortalityform',
            'cms_trackingform',
            'cms_vital'
        ];

        try {
            $db = Yii::$app->db;
            $db->createCommand("SET FOREIGN_KEY_CHECKS = 0;")->execute();
            foreach ($tables as $t) {
                $db->createCommand("TRUNCATE TABLE `$t`;")->execute();
            }
            $db->createCommand("SET FOREIGN_KEY_CHECKS = 1;")->execute();

            return [
                'status' => 'success',
                'message' => 'Database screening tables cleared successfully!'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}