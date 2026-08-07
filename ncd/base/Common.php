<?php

namespace app\base;

use Yii;
use yii\helpers\Url;
use yii\helpers\Html;
use yii\helpers\ArrayHelper;
use yii\grid\GridView;
use yii\data\ArrayDataProvider;

use kartik\widgets\DepDrop;

use app\base\Converter;
use rmrevin\yii\fontawesome\FA;

use app\models\Attandance;
use app\models\Surveymaster;
use app\models\Locationmaster;
use app\models\Mainmenu;
use app\models\Submenu;
use app\models\Menuprivileges;
use app\models\Trackingform;
use app\models\Mortalityform;
use app\models\Users;
use app\models\Clientidref;
use app\models\Locationmapping;
use app\models\Applicationsettings;
use app\models\Settings;
use app\models\Fieldmaster;
use app\models\State;
use app\models\Staff;
use app\models\Dg;
use app\models\Mdhl;
use app\models\Apm;
use app\models\Cprca;
use app\models\Vital;
use app\models\Bsr;
use app\models\Cml;
use app\models\Ce;
use app\models\Fupm;
use app\models\Cchv;

$Settings = Settings::find()->orderBy(["stngs_id" => SORT_ASC])->one();
Yii::$app->params['SURVEY'] = $Settings->stngs_survey_code;
Yii::$app->params['SURVEY_FIXED'] = $Settings->stngs_survey_fixed;
if(isset($Settings->surveys)) {
	Yii::$app->params['SURVEY_TITLE'] = $Settings->surveys->sur_title;
} else {
	Yii::$app->params['SURVEY_TITLE'] = '';
}

if($Settings->stngs_survey_code != "") {
	$AppSettings = Applicationsettings::find()->where(["app_survey_id" => Yii::$app->params['SURVEY']])->orderBy(["app_stngs_id" => SORT_ASC])->one();
	Yii::$app->params['LOCATION'] = $AppSettings->app_location;
	Yii::$app->params['LOCATION_FIXED'] = $AppSettings->app_location_fixed;
	if(isset($AppSettings->locations)) {
	    Yii::$app->params['LOCATION_TITLE'] = $AppSettings->locations->loc_name;
	} else {
	    Yii::$app->params['LOCATION_TITLE'] = '';
	}
}
class Common
{	
    public static function getSurvey()
    {
    	$Surveys = ArrayHelper::map(Surveymaster::find()->orderBy(["sur_id" => SORT_ASC])->all(), 'sur_code', 'sur_title');
    	return $Surveys;
    }
    

    public static function getLocations()
    {
        $Locations = ArrayHelper::map(Locationmaster::find()->where(["status" => 1])->orderBy(["loc_name" => SORT_ASC])->all(), 'loc_code', 'loc_name');
        return $Locations;
    }

	
    public static function getMainmenus()
    {
        $Mainmenus = ArrayHelper::map(Mainmenu::find()->orderBy(["min_mnu_desc" => SORT_ASC])->all(), 'min_mnu_id', 'min_mnu_desc');
        return $Mainmenus;
    }

    public static function getSubmenus()
    {
        $Submenus = ArrayHelper::map(Submenu::find()->orderBy(["sub_mnu_desc" => SORT_ASC])->all(), 'sub_mnu_id', 'sub_mnu_desc');
        return $Submenus;
    }

    public static function getUsers()
    {
        $Users = ArrayHelper::map(Users::find()->orderBy(["users_name" => SORT_ASC])->all(), 'usr_id', 'users_name');
        return $Users;
    }

   
  
    public static function getMenuname()
    {
        $Submenu = Submenu::find()->where(["sub_mnu_name" => Yii::$app->controller->id.'/'.Yii::$app->controller->action->id])->one();
        if($Submenu !== null)
            return $Submenu->sub_mnu_desc;
        else {
            // $Submenu = Submenu::find()->where(["LIKE", "sub_mnu_name", Yii::$app->controller->id])->one();
            $Submenu = Submenu::find()->where("sub_mnu_name like '".Yii::$app->controller->id."%'")->one();
            if($Submenu !== null)
                return $Submenu->sub_mnu_desc;
        }
    }

    public static function getPrivileges($option)
    {
        $Menuprivileges = Menuprivileges::find()->joinWith('submenus s')->where(["s.sub_mnu_name" => Yii::$app->controller->id])->andWhere(["mnu_acs_usr_id_fk" => Yii::$app->user->getId()])->one();
        $Menuprivileges = Menuprivileges::find()->joinWith('submenus s')->where(["LIKE", "s.sub_mnu_name", Yii::$app->controller->id])->andWhere(["mnu_acs_usr_id_fk" => Yii::$app->user->getId()])->one();
        if($Menuprivileges !== null) {
            if($option == 'Create')
                return $Menuprivileges->mnu_acs_add;
            elseif($option == 'Update')
                return $Menuprivileges->mnu_acs_edit;
            elseif($option == 'Delete')
                return $Menuprivileges->mnu_acs_delete;
        } else
            return true;
    }

       
   
    public static function getClientid($sid = "", $loc = "")
    {
     	
	  if($sid == "" && $loc == "") {
            $AppSettings = Applicationsettings::find()->orderBy(["app_stngs_id" => SORT_ASC])->one();
			$Surveycode=$AppSettings->app_survey_id;
	        //$Loccode  = $AppSettings->app_location;   
            $Loccode  = Yii::$app->user->identity->signedin_loc;			
            $CModel = Clientidref::find()->where(["clientid_ref_sur" => $Surveycode, "clientid_ref_loc" => $Loccode])->one();          
        } else {			
            $CModel = Clientidref::find()->where(["clientid_ref_sur" => $sid, "clientid_ref_loc" => $loc])->one();        
            $Loccode = $loc;
        }		
	
        if($CModel  !== null) {
            if ($CModel->clientid_ref_sur == null){
			 $ref_code = 0;
			}
		    else {
			 $ref_code=$CModel->clientid_ref_code;
			} 
			
			$refid = ($ref_code+1);
		}	
		else {
		 $refid = 1;
		}
		
	    $cidno = str_pad($refid, 4, 0, STR_PAD_LEFT);
		$clientid = $Loccode."-".$cidno;
		return $clientid;
		
	}
	
    public static function getSurlocations($id)
    {
        $Locations = ArrayHelper::map(Locationmapping::find()->innerJoinWith('locations L')->where(["loc_mapng_sur_id" => $id])->orderBy(["L.loc_name" => SORT_ASC])->all(), 'locations.loc_code', 'locations.loc_name');
        return $Locations;
    }

    public static function generateControl($form, $model, $template, $ctrlid, $ctrllist, $type, $commonfun = "", $depends = "")
    {
    	$storevalue = $dispvalue = "";
        if($type == "survey") {
            $fixed = Yii::$app->params['SURVEY_FIXED'];
            if($model->isNewRecord) {
                $storevalue = Yii::$app->params['SURVEY'];
                $dispvalue = Yii::$app->params['SURVEY_TITLE'];
            } else {
                $storevalue = $model->$ctrlid;
                $SModel = Surveymaster::find()->where(["sur_code" => $model->$ctrlid])->one();
                $dispvalue = $SModel->sur_title;
            }
            echo Html::hiddenInput('common-method', $commonfun, ['id'=>'common-method']);
            echo Html::hiddenInput('common-method-type', $depends, ['id'=>'common-method-type']);
        } elseif($type == "location") {
            $fixed = Yii::$app->params['LOCATION_FIXED'];
            if($model->isNewRecord) {
                $storevalue = Yii::$app->params['LOCATION'];
                $dispvalue = Yii::$app->params['LOCATION_TITLE'];
            } else {
                $storevalue = $model->$ctrlid;
                $LModel = Locationmaster::find()->where(["loc_code" => $model->$ctrlid])->one();
                $dispvalue = $LModel->loc_name;
            }
        } elseif($type == "pid") {
            $fixed = false;
            $storevalue = $model->$ctrlid;
            $dispvalue = $model->$ctrlid;
        }

        if($model->isNewRecord) {
            if(!$fixed) {
            	if($storevalue != "")
            		$model->$ctrlid = $storevalue;
                if($type == "survey") {
                    return $form->field($model, $ctrlid, $template)->dropDownList($ctrllist, ['prompt' => $model->getAttributeLabel($ctrlid)]);
                } elseif($type == "location") {
                    return $form->field($model, $ctrlid, $template)->widget(DepDrop::classname(), ['data'=>$ctrllist, 'options'=>['prompt'=>$model->getAttributeLabel($ctrlid)], 'pluginOptions'=>['depends'=>$depends, 'placeholder'=>$model->getAttributeLabel($ctrlid), 'url'=>Url::to(['/dashboard/getloc'])]]);
                } elseif($type == "pid") {
                    return $form->field($model, $ctrlid, $template)->widget(DepDrop::classname(), ['data'=>$ctrllist, 'options'=>['prompt'=>$model->getAttributeLabel($ctrlid)], 'type'=>DepDrop::TYPE_SELECT2, 'pluginOptions'=>['depends'=>$depends, 'placeholder'=>$model->getAttributeLabel($ctrlid), 'url'=>Url::to(['/dashboard/getids']), 'params'=>['common-method', 'common-method-type']]]);
                }
            } else {
                $template['template'] = preg_replace_callback("/{\\w+}/", function ($matches) use ($dispvalue) {
                    switch ($matches[0]) {
                        case '{error}':
                            return $dispvalue;
                        default:
                            return $matches[0];
                    }
                }, $template['template']);
                return $form->field($model, $ctrlid, $template)->hiddenInput(['value' => $storevalue]);
            }
        } else {
            $template['template'] = preg_replace_callback("/{\\w+}/", function ($matches) use ($dispvalue) {
                switch ($matches[0]) {
                    case '{error}':
                            return $dispvalue;
                    default:
                        return $matches[0];
                }
            }, $template['template']);
            return $form->field($model, $ctrlid, $template)->hiddenInput(['value' => $storevalue]);
        }
    }

    public static function getFieldvalue($frmfield = "")
    {
        if($frmfield == "")
            return [];
        $fields = ArrayHelper::map(Fieldmaster::find()->where(["fld_mstr_frmfield" => $frmfield])->andWhere(["status" => 1])->orderBy(["fld_mstr_code" => SORT_ASC])->all(), 'fld_mstr_code', 'fld_mstr_desc');
        return $fields;
    }


    public static function convertTemplate($template, $type, $value)
    {
        $matches = preg_split('/(<[^>]*[\/div]>)/i', $template['template'], -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
        if($type == "prepand") {
            $len = count($matches);
            $matches[] = $matches[$len-1];
            $matches[$len-1] = $matches[$len-2];
            $matches[$len-2] = '<div class="col-md-3 text-prepand">'.$value.'</div>';
        } else {
            $matches[] = '<div class="col-md-3 text-postpand">'.$value.'</div>';
        }
        $template['template'] = implode("", $matches);
        return $template;
    }
		
	 public static function getUsername($uid)
    {
        $Users = Users::find()->where(["usr_id" => $uid])->one();
      
	   if($Users  !== null)	
         return $Users->users_name;		
	   else
 		return "";
    }
	
	public static function getStateMaster()
    {
        $StateMaster = ArrayHelper::map(State::find()->where(["status" => 1])->orderBy(["state" => SORT_ASC])->all(), 'state_code', 'state');
        return $StateMaster;
    }
	
	public static function getSitelocation()
    {
		$sloc=Yii::$app->user->identity->signedin_loc;
		$suser=Yii::$app->user->identity->users_name;

		$Usermodel = Users::find()->where(['users_name' => $suser])->one();			   
		$UserRole= $Usermodel->user_role;	

		$statecode=Yii::$app->user->identity->state_code;

		if($UserRole ==1) 
		  $Locationmaster = ArrayHelper::map(Locationmaster::find()->where(["status" => 1])->andWhere(["state_code"=>$statecode])->orderBy(["loc_name" => SORT_ASC])->all(), 'loc_code', 'loc_name');
		else
		  $Locationmaster = ArrayHelper::map(Locationmaster::find()->where(["status" => 1])->andWhere(["loc_code" => $sloc])->orderBy(["loc_name" => SORT_ASC])->all(), 'loc_code', 'loc_name'); 	  

        return $Locationmaster;
    }
	
	 public static function getLocmap()  
   {
	   $sloc=Yii::$app->user->identity->signedin_loc;    
       $Locationmaster =Locationmaster::find()->where(["loc_code" =>$sloc])->andWhere(["status" => 1])->one();	
	   	   	   
	   return $Locationmaster->state_code;
		
   }	

   public static function getLocdistrict()
    {   
        $sloc=Yii::$app->user->identity->signedin_loc;		
        return $sloc;
    }   
	
	 public static function getLocstate()  
   {
	   $sloc=Yii::$app->user->identity->signedin_loc;    
       $Locationmaster =Locationmaster::find()->where(["loc_code" => $sloc])->andWhere(["status" => 1])->one();	

       $StateMaster = State::find()->where(["state_code" =>$Locationmaster->state_code])->andWhere(["status" => 1])->one();
       return $StateMaster->state;	  
	 
   }
   
     public static function getEmptydata()
    {
        $Codes = ArrayHelper::map(Locationmaster::find()->where(["status" => 2])->all(), 'loc_code', 'loc_name');
        return $Codes;
    }
	

	  public static function getAttendancePIDs($sid = "", $loc = "")
    {
        $PIDs = ArrayHelper::map(Attandance::find()->where(["loc_code" => $loc])->andWhere(["visit_date" => strtotime(date("Y/m/d"))])->andWhere(["IS", "out_interviewer", NULL])->orderBy(["pid" => SORT_ASC])->all(), 'pid', 'pid');
        return $PIDs;
    }
	

	 public static function getAttendanceOutPIDs($sid = "", $loc = "")
    {
        $PIDs = ArrayHelper::map(Attandance::find()->where(["loc_code" => $loc])->andWhere(["IS", "out_interviewer", NULL])->andWhere(["IS", "visit_out", NULL])->orderBy(["pid" => SORT_ASC])->all(), 'pid', 'pid');
        return $PIDs;
    }

 	
   public static function getSigninLoc()
    {   
        $sloc=Yii::$app->user->identity->signedin_loc;		
        return $sloc;
    }  


	public static function getStaffMaster()
    {
        $StaffMaster = ArrayHelper::map(Staff::find()->where(["status" => 1])->orderBy(["staff_code" => SORT_ASC])->all(), 'staff_code', 'staff_name');
        return $StaffMaster;
    }	
	
	
	public static function getSurveyid($sid = "", $loc = "")
    {     	
	  if($sid == "" && $loc == "") {
            $AppSettings = Applicationsettings::find()->orderBy(["app_stngs_id" => SORT_ASC])->one();
			$Surveycode=$AppSettings->app_survey_id;	
           return $Surveycode;			
        } 
	}
		
	public static function getDefaultLoc()
    {     	
	  
            $AppSettings = Applicationsettings::find()->orderBy(["app_stngs_id" => SORT_ASC])->one();
			$DefLoc=$AppSettings->app_location;	
            return $DefLoc;			
      
	}
	
	  public static function getRegistrationPIDs()
    {
		$PIDs = ArrayHelper::map(Dg::find()->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');
		return $PIDs;
    }
	
	public static function getEnrollPIDs($sec, $sid = "", $loc = "")	  
	{
	    $dgtable=Dg::tableName();	
		$mdhltable=Mdhl::tableName();	
		$apmtable = Apm::tableName();		
		$vitaltable = Vital::tableName();
		$bsrtable = Bsr::tableName();
		$cetable = Ce::tableName();
		$cmltable = Cml::tableName();
	    $cprcatable = Cprca::tableName();
        $fupmtable = Fupm::tableName();   
        $mortable = Mortalityform::tableName();   	
		$tracktable = Trackingform::tableName(); 
		$cchvtable=Cchv::tableName();	
		
	 if($sec == "mdhl"){	
		 $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT mdhl_pid FROM $mdhltable where $dgtable.dg_pid=mdhl_pid)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
         return $model;
     } elseif($sec == "apm"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT apm_pid FROM $apmtable where $dgtable.dg_pid=apm_pid)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;	 
	 }	elseif($sec == "cprca"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT cprca_pid FROM $cprcatable where $dgtable.dg_pid=cprca_pid)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;	 
	 } elseif($sec == "cml"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT cml_pid FROM $cmltable where $dgtable.dg_pid=cml_pid)")->andWhere("dg_pid IN (SELECT ce_pid FROM $cetable where $dgtable.dg_pid=ce_pid)")->andWhere("dg_pid IN (SELECT ce_pid FROM $cetable where $dgtable.dg_pid=ce_pid and ce_q6<>'' and ce_q6<>'2')")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;		
	 } elseif($sec == "ce"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT ce_pid FROM $cetable where $dgtable.dg_pid=ce_pid)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;	 
	 } elseif($sec == "bsr"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT bsr_pid FROM $bsrtable where $dgtable.dg_pid=bsr_pid)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;	 
	 } elseif($sec == "vital"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT vital_pid FROM $vitaltable where $dgtable.dg_pid=vital_pid)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;	 
	 }
	 elseif($sec == "fupm"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT fupm_pid FROM $fupmtable where $dgtable.dg_pid=fupm_pid)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;	 
	 }
	  elseif($sec == "mor"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT mortality_form_part_id FROM $mortable where $dgtable.dg_pid=mortality_form_part_id)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;	 
	 }
	 elseif($sec == "track"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT track_form_part_id FROM $tracktable where $dgtable.dg_pid=track_form_part_id)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model;	 
	 }
	 elseif($sec == "cchv"){	
	    $model = ArrayHelper::map(Dg::find()->where("dg_pid Not IN (SELECT cchv_pid FROM $cchvtable where $dgtable.dg_pid=cchv_pid)")->orderBy(["dg_pid" => SORT_ASC])->all(), 'dg_pid', 'dg_pid');	
	    return $model; 	 
	 }
	}
  }
			
 
