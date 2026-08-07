<?php

namespace app\models;

use Yii;
use yii\base\Model;
use app\base\Converter;
use app\models\Trackingform;
use app\models\Users;

/**
 * Trackingreport is the model behind the contact form.
 */
class Trackingreport extends Model
{
    public $frmdate, $todate;
    public $loc;

	public $services = ['Client ID','track_form_q1','track_form_q2a','track_form_q2b','track_form_q2c','track_form_q2d','track_form_q2e','track_form_q3a','track_form_q3b','track_form_q3c','track_form_q3d','track_form_q3e','track_form_q4','track_form_q5','status','create_time','create_user','update_time','update_user','record_date'];
    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            [['frmdate', 'todate'], 'required'],
            [['todate'], 'dateValidate'],
            ['loc','safe'], 
        ];
    }
	
	public function getUserrole()
	{
	    $sloc=Yii::$app->user->identity->signedin_loc;
		$suser=Yii::$app->user->identity->users_name;
		$Usermodel = Users::find()->where(['users_name' => $suser])->one();	   
		
        if ($Usermodel !== null) {		
         return $Usermodel->user_role;			
        } 
	}

    /**
     * @return array customized attribute labels
     */
    public function attributeLabels()
    {
        return [
            'frmdate' => 'Beginning Date',            
            'todate' => 'End Date',    
			'loc' => 'Spoke',			
        ];
    }
	
	public function getTrackingformstartdate()
	{
		$Gmodel = Trackingform::find()->orderBy(['record_date' => SORT_ASC])->one();
		if($Gmodel !== null) {	
			 
			 if(!is_integer($Gmodel->record_date))
					$date = Converter::toStore($Gmodel->record_date);
				else
				  $date  = $Gmodel->record_date;		
				return Converter::toDisplay($date);	
		} else
			 $date = strtotime(date("Y/m/d"));
             return Converter::toDisplay($date);				
	}

    public function dateValidate($attribute, $params) {
        if($this->frmdate != "" && $this->todate != "") {
            $this->frmdate = Converter::toStore($this->frmdate);
            $this->todate = Converter::toStore($this->todate);
            if($this->todate < $this->frmdate) {
                $this->frmdate = Converter::toDisplay($this->frmdate);
                $this->todate = Converter::toDisplay($this->todate);
                $this->addError($attribute, "End Date cannot be prior to Beginning Date");
            } else {
                $this->frmdate = Converter::toDisplay($this->frmdate);
                $this->todate = Converter::toDisplay($this->todate);
            }
        }
    }
}
