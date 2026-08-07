<?php

namespace app\models;

use Yii;
use yii\helpers\Html;
use yii\behaviors\TimestampBehavior;
use app\base\Converter;
use app\models\Applicationsettings;
use app\base\Common;

/**
 * This is the model class for table "{{%registration}}".
 *
 * @property integer $mdhl_id
 * @property string $mdhl_survey
 * @property string $mdhl_pid
 * @property string $mdhl_loc
 * @property string $mdhl_q1
 * @property string $mdhl_q2
 * @property integer $mdhl_q3
 * @property integer $mdhl_q4
 * @property integer $mdhl_q5
 * @property integer $mdhl_q6
 * @property integer $mdhl_q7
 * @property integer $mdhl_q8
 * @property integer $mdhl_q9
 * @property integer $mdhl_q10
 * @property string $mdhl_q11
 * @property integer $mdhl_q12
 * @property integer $mdhl_q13
 * @property string $mdhl_q14
 * @property string $mdhl_q15
 * @property string $mdhl_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Mdhl extends \yii\db\ActiveRecord
{
	public $yes_no = [1 => "Yes", 2 => "No"];
	public $yes_no_dk = [1 => "Yes", 2 => "No", 3 => "Don't Know"];
	public $med1 = [2 => "Diabetes", 3 => "Hypertension", 4 => "Cardiovascular Disease (Heart Attack, Stroke, etc.)", 7 => "Cerebrovascular Disease (Paralysis/Stroke, etc.)", 5 => "Chronic Respiratory Disease (Asthma, COPD, etc.)", 6 => "Cancer",1 => "None of the above"];
	public $med2 = [1 => "Diabetes", 2 => "Hypertension", 3 => "Cardiovascular Disease", 4 => "Chronic Respiratory Disease", 5 => "Cancer"];	
	public $med3 = [1 => "Diabetes medication", 2 => "Blood pressure medication", 3 => "Heart medication", 4 => "Respiratory medication", 5 => "Other"];
	public $often1 = [1 => "Daily", 2 => "Occasionally", 3 => "Rarely"];
	public $often2 = [1 => "Daily", 2 => "Weekly", 3 => "Monthly", 4 => "Rarely"];
	public $serving = [1 => "Less than 1 serving", 2 => "1-2 servings", 3 => "3-4 servings", 4 => "5 or more"];
	public $days = [1 => "0", 2 => "1-2", 3 => "3-4", 4 => "5 or more"];
	
    public $often = [0 => "", 1 => "", 2 => "", 3 => ""];
	public $q8= [0 => "Not difficult at all", 1 => "Somewhat difficult", 2 => "Very difficult", 3 => "Extremely difficult"];
	public $severity_gad = [1 => "Minimal anxiety", 2 => "Mild anxiety", 3 => "Moderate anxiety", 4 => "Severe depression"];
	public $q10= [0 => "Not difficult at all", 1 => "Somewhat difficult", 2 => "Very difficult", 3 => "Extremely difficult"];
	public $severity_phq = [1 => "Minimal depression", 2 => "Mild depression", 3 => "Moderate depression", 4 => "Moderately severe depression", 5 => "Severe depression"];
		
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%mdhl}}';
	}
	

	/**
	 * @inheritdoc
	 */
	public function behaviors()
	{
		return [
			[
				'class' => TimestampBehavior::className(),
				'createdAtAttribute' => 'create_time',
				'updatedAtAttribute' => 'update_time',
				'value' => date('U'),
			]
		];
	}

	/**
	 * @inheritdoc
	 */
	public function rules()
	{
		return [
			[['mdhl_survey', 'mdhl_pid', 'mdhl_loc','mdhl_date', 'mdhl_q6', 'mdhl_q7', 'mdhl_q8', 'mdhl_q9', 'mdhl_q10','mdhl_q11','mdhl_q12','mdhl_q13a', 'mdhl_q13b','mdhl_q15a','mdhl_q15b', 'mdhl_q16','mdhl_q17','mdhl_q18','mdhl_q19'], 'required', 'message' => 'Cannot be blank.'],
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
       

            [['mdhl_q6a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {		
			}, 'whenClient' => "function (attribute, value) {				
				return $('#mdhl-mdhl_q6-6').prop('checked');
			}"],			

            [['mdhl_q7a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->mdhl_q7 == 1;
			}, 'whenClient' => "function (attribute, value) {
				return $('#mdhl-mdhl_q7').val() == '1';
			}"],	

           [['mdhl_q8a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->mdhl_q8 == 1;
			}, 'whenClient' => "function (attribute, value) {
				return $('#mdhl-mdhl_q8').val() == '1';
			}"],	
           [['mdhl_q9a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->mdhl_q9 == 1;
			}, 'whenClient' => "function (attribute, value) {
				return $('#mdhl-mdhl_q9').val() == '1';
			}"],	
            
           [['mdhl_q19a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->mdhl_q19 == 1;
			}, 'whenClient' => "function (attribute, value) {
				return $('#mdhl-mdhl_q19').val() == '1';
			}"],	
            
        
           [['mdhl_q19b'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {				
			}, 'whenClient' => "function (attribute, value) {
				return ($('#mdhl-mdhl_q19').val() == '1' &&   $('#mdhl-mdhl_q19a-5').prop('checked'));
			}"],				
		

            [['gad_q1', 'gad_q2', 'gad_q3', 'gad_q4', 'gad_q5','gad_q6','gad_q7','gad_tot_score','gad_anxiety_severity'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return ($model->mdhl_q13a == 1 || $model->mdhl_q13b== 1);
			}, 'whenClient' => "function (attribute, value) {
				return ($('#mdhl-mdhl_q13a').val() == '1' || $('#mdhl-mdhl_q13b').val() == '1');
			}"],	

           [['gad_q8'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return (($model->mdhl_q13a == 1 || $model->mdhl_q13b== 1) && ($model->gad_q1 != 0 || $model->gad_q2 != 0 || $model->gad_q3 != 0 || $model->gad_q4 != 0 || $model->gad_q5 != 0 || $model->gad_q6 != 0 || $model->gad_q7 != 0 ));
			}, 'whenClient' => "function (attribute, value) {
				 return (($('#mdhl-mdhl_q13a').val() == '1' || $('#mdhl-mdhl_q13b').val() == '1') && ($('#mdhl-gad_q1').val() != 0 || $('#mdhl-gad_q2').val() != 0 || $('#mdhl-gad_q3').val() !=  0 || $('#mdhl-gad_q4').val() != 0 || $('#mdhl-gad_q5').val() != 0 || $('#mdhl-gad_q6').val() != 0  || $('#mdhl-gad_q7').val() != 0 )) ;
			}"],	

            [[ 'phq_q1', 'phq_q2', 'phq_q3', 'phq_q4', 'phq_q5','phq_q6','phq_q7','phq_q8','phq_q9','phq_tot_score','phq_depression_severity'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return ($model->mdhl_q15a == 1 || $model->mdhl_q15b== 1);
			}, 'whenClient' => "function (attribute, value) {
				return ($('#mdhl-mdhl_q15a').val() == '1' || $('#mdhl-mdhl_q15b').val() == '1');
			}"],	
			
			[['phq_q10'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return (($model->mdhl_q15a == 1 || $model->mdhl_q15b== 1) && ($model->phq_q1 != 0 || $model->phq_q2 != 0 || $model->phq_q3 != 0 || $model->phq_q4 != 0 || $model->phq_q5 != 0 || $model->phq_q6 != 0 || $model->phq_q7 != 0 || $model->phq_q8 != 0 || $model->phq_q9 != 0));
			}, 'whenClient' => "function (attribute, value) {
				 return  (($('#mdhl-mdhl_q15a').val() == '1' || $('#mdhl-mdhl_q15b').val() == '1') && ($('#mdhl-phq_q1').val() != 0 || $('#mdhl-phq_q2').val() != 0 || $('#mdhl-phq_q3').val() !=  0 || $('#mdhl-phq_q4').val() != 0 || $('#mdhl-phq_q5').val() != 0 || $('#mdhl-phq_q6').val() != 0  || $('#mdhl-phq_q7').val() != 0 || $('#mdhl-phq_q8').val() != 0 || $('#mdhl-phq_q9').val() != 0) );
	    	}"],				
			
								
			[['status'], 'string', 'max' => 1],		
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
		];
	}


	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'mdhl_id' => Yii::t('app', 'ID'),
			'mdhl_survey' => Yii::t('app', 'Survey'),
			'mdhl_pid' => Yii::t('app', 'Client ID'),
			'mdhl_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'mdhl_date' => Yii::t('app', 'Date'),
			'mdhl_q6' => Yii::t('app', '6. Have you ever been diagnosed with any of the following? (Check all that apply)'),
			'mdhl_q6a' => Yii::t('app', '6a. Specify type'),
			'mdhl_q7' => Yii::t('app', '7. Family History of NCDs'),
			'mdhl_q7a' => Yii::t('app', '7a. If yes, which? (Check all that apply)'),
			'mdhl_q8' => Yii::t('app', '8. Have you ever used tobacco (smoking or chewing)?'),
			'mdhl_q8a' => Yii::t('app', '8a. If yes, how often?'),
            'mdhl_q9' => Yii::t('app', '9. Have you consumed alcohol in the last month?'),
			'mdhl_q9a' => Yii::t('app', '9a. If yes, how often?'),	
            'mdhl_q10' => Yii::t('app', '10. How many servings of vegetables do you consume daily? '),			
            'mdhl_q11' => Yii::t('app', '11. How many servings of fruits do you consume daily? '),
			'mdhl_q12' => Yii::t('app', '12. On how many days last week did you do at least 30 minutes of physical activity?'),		
            'mdhl_q13a' => Yii::t('app', '13a. Not being able to stop or control worrying '),
			'mdhl_q13b' => Yii::t('app', '13b. Feeling nervous, anxious or on edge '),	
            'mdhl_q15a' => Yii::t('app', '14a. Little interest or pleasure in doing things '),
			'mdhl_q15b' => Yii::t('app', '14b. Feeling down, depressed or hopeless '),	
            'mdhl_q16' => Yii::t('app', '15. Have you noticed any unexplained weight change (loss or gain) in the past 6 months?'),
			'mdhl_q17' => Yii::t('app', '16. Do you experience shortness of breath or chest pain during routine activities?'),			
            'mdhl_q18' => Yii::t('app', '17. Have you been told you have high blood pressure or high blood sugar in the past?'),
			'mdhl_q19' => Yii::t('app', '18. Do you take any medications regularly?'),	
            'mdhl_q19a' => Yii::t('app', '18a. If yes, please specify'),
			'mdhl_q19b' => Yii::t('app', '18b. Specify Other'),
            'gad_q1' => Yii::t('app', '1. Feeling nervous, anxious, or on edge'),
			'gad_q2' => Yii::t('app', '2. Not being able to stop or control worrying'),
			'gad_q3' => Yii::t('app', '3. Worrying too much about different things'),
			'gad_q4' => Yii::t('app', '4. Trouble relaxing	'),
			'gad_q5' => Yii::t('app', '5. Being so restless that it is hard to sit still'),
			'gad_q6' => Yii::t('app', '6. Becoming easily annoyed or irritable'),
			'gad_q7' => Yii::t('app', '7. Feeling afraid, as if something awful might happen'),
			'gad_q8' => Yii::t('app', '8. If you checked any problems, how difficult have they made it for you to do your work, take care of things at home, or get along with other people?'),		
			'gad_tot_score' => Yii::t('app', 'Total Score'),
			'gad_anxiety_severity' => Yii::t('app', 'Anxiety Severity'),	
		    'phq_q1' => Yii::t('app', '1. Little interest or pleasure in doing things'),
			'phq_q2' => Yii::t('app', '2. Feeling down, depressed, or hopeless'),
			'phq_q3' => Yii::t('app', '3. Trouble falling or staying asleep, or sleeping too much'),
			'phq_q4' => Yii::t('app', '4. Feeling tired or having little energy'),
			'phq_q5' => Yii::t('app', '5. Poor appetite or overeating'),
			'phq_q6' => Yii::t('app', '6. Feeling bad about yourself - or that you are a failure or have let yourself or your family down'),
			'phq_q7' => Yii::t('app', '7. Trouble concentrating on things, such as reading the newspaper or watching television'),
			'phq_q8' => Yii::t('app', '8. Moving or speaking so slowly that other people could have noticed? Or the opposite – being so fidgety or restless that you have been moving around a lot more than usual'),
			'phq_q9' => Yii::t('app', '9. Thoughts that you would be better off dead or of hurting yourself in some way'),
			'phq_q10' => Yii::t('app', '10. Thinking about the problems you reported as bothersome in the questions I just asked, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?'),
			'phq_tot_score' => Yii::t('app', 'Total Score'),
			'phq_depression_severity' => Yii::t('app', 'Depression Severity'),
			'status' => Yii::t('app', 'Status'),
			'create_time' => Yii::t('app', 'Create Time'),
			'create_user' => Yii::t('app', 'Create User'),
			'update_time' => Yii::t('app', 'Update Time'),
			'update_user' => Yii::t('app', 'Update User'),
		];
	}
	
	 public function getLocations()
    {
        return $this->hasOne(\app\models\Locationmaster::className(), ['loc_code' => 'loc_code']);
    }

	
	public function beforeSave($insert)
	{
		if (parent::beforeSave($insert)) {		
		 $this->mdhl_pid = strtoupper($this->mdhl_pid);		 
			 if($this->mdhl_date != "")
				$this->mdhl_date = Converter::toStore($this->mdhl_date);
			
	        return true;
	    } else {
	        return false;
	    }
	}
	
	public function afterFind()
	{
		parent::afterFind();
		
		if(Yii::$app->controller->action->id != "index" && Yii::$app->controller->action->id != "view") {			
		    if($this->mdhl_date != "")
				$this->mdhl_date = Converter::toDisplay($this->mdhl_date);
		}
		
		if(Yii::$app->controller->action->id == "update" ) {
			$this->mdhl_q6 = explode(",", $this->mdhl_q6);
			$this->mdhl_q7a = explode(",", $this->mdhl_q7a);
			$this->mdhl_q19a = explode(",", $this->mdhl_q19a);
		}
	}
	
		
	
}

