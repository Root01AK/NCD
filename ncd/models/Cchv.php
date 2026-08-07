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
 * @property integer $cchv_id
 * @property string $cchv_survey
 * @property string $cchv_pid
 * @property string $cchv_loc
 * @property string $cchv_q1
 * @property string $cchv_q2
 * @property integer $cchv_q3
 * @property integer $cchv_q4
 * @property integer $cchv_q5
 * @property integer $cchv_q6
 * @property integer $cchv_q7
 * @property integer $cchv_q8
 * @property integer $cchv_q9
 * @property integer $cchv_q10
 * @property string $cchv_q11
 * @property integer $cchv_q12
 * @property integer $cchv_q13
 * @property string $cchv_q14
 * @property string $cchv_q15
 * @property string $cchv_q16
 * @property integer $iccplus_date
 * @property integer $icc_date
 * @property string $status
 * @property integer $create_time
 * @property integer $create_user
 * @property integer $update_time
 * @property integer $update_user
 */
class Cchv extends \yii\db\ActiveRecord
{
	public $yes_no_na = [1 => "Yes", 2 => "No",3 => "Not applicable (self-medication)", 4 => "Don’t know / Refuse to answer"];
	public $yes_no_dk = [1 => "Yes", 2 => "No", 3 => "Don’t know / Refuse to answer"];
	public $yes_no_dk_rf = [1 => "Yes", 2 => "No", 3 => "Don't Know", 4 => "Refuse to answer"];
		
	public $q53 = [1 => "13–19 (adolescent)", 2 => "20–29", 3 => "30–39", 4 => "40–49" , 5 => "50–59", 6 => "60+", 7 => "Refuse to answer"];
	public $q54 = [1 => "Male", 2 => "Female", 3 => "Intersex", 4 => "Refuse to answer"];		
	public $q55 = [1 => "Male", 2 => "Female", 3 => "Transgender", 4 => "Non-binary/Genderqueer", 5 => "Other ", 6 => "Refuse to answer" ];
	public $q56 = [1 => "Adolescent (13–19 years)", 2 => "Man who has sex with men (MSM)", 3 => "Person who injects drugs (PWID)", 4 => "Woman living with HIV", 5 => "General population man ",6 => "General population woman", 7 => "Older adult (60+ years)", 8 => "Other", 9 => "Refuse to answer" ];
	public $q57 = [1 => "No formal education", 2 => "Primary school (up to Class 5)", 3 => "Secondary school (Class 6–10)", 4 => "Higher secondary (Class 11–12)", 5 => "Graduate or higher",6 => "Vocational training", 7 => "Refuse to answer" ];
		
	public $q58 = [1 => "Student", 2 => "Employed (formal job, e.g., office/factory)", 3 => "Self-employed (e.g., farming, small business)", 4 => "Unemployed", 5 => "Homemaker", 6 => "Retired", 7 => "Other ", 8 => "Refuse to answer"];
	public $q59 = [1 => "Below 10,000", 2 => "10,001–25,000", 3 => "25,001–50,000", 4 => "50,001–1,00,000", 5 => "Above 1,00,000", 6 => "Don't know", 7 => "Refuse to answer" ];
	public $q60 = [1 => "Urban (city/town)", 2 => "Peri-urban (suburbs/outskirts)", 3 => "Rural (village)", 4 => "Refuse to answer"];
	public $q61 = [1 => "Good ventilation (e.g., windows, fans)", 2 => "Risk of flooding (e.g., low-lying area)", 3 => "Access to sanitation (e.g., toilet, clean water)", 4 => "Poor ventilation or overcrowding", 5 => "No flooding risk", 6 => "No sanitation access", 7 => "Other", 8 => "Refuse to answer"];
	public $q99 = [1 => "Fever", 2 => "Diarrhea", 3 => "Respiratory infection", 4 => "Skin/soft tissue infection", 5 => "Sexually transmitted infection", 6 => "Other", 7 => "Don’t know / Refuse to answer"];
	public $q100 = [1 => "Registered medical practitioner", 2 => "Pharmacist", 3 => "Informal provider / traditional healer", 4 => "Self-medication based on prior experience", 5 => "Family member or friend", 6 => "Don’t know / Refuse to answer" ];	
	public $q102 = [1 => "Less than 3 days", 2 => "3–5 days", 3 => "6–7 days", 4 => "More than 7 days", 5 => "Don’t know / Refuse to answer" ];
	public $q104 = [1 => "Symptoms improved", 2 => "Could not access medicines due to climate events (floods, heat, transport disruption)", 3 => "Cost of medicines", 4 => "Side effects", 5 => "Ran out of medicines", 6 => "Other", 7 => "Don’t know / Refuse to answer"];
	
	public $tf = [1 => "", 2 => "", 3 => "", 4 => ""];
	
	//public $q = [1 => "Daily", 2 => "Weekly", 3 => "Monthly", 4 => "Rarely"];
	//public $q = [1 => "Daily", 2 => "Weekly", 3 => "Monthly", 4 => "Rarely", 5 => "Daily", 6 => "Weekly", 7 => "Monthly", 8 => "Rarely"];
	
	/**
	 * @inheritdoc
	 */
	
    public static function tableName()
	{
		return '{{%cchv}}';
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
			[['cchv_survey', 'cchv_pid', 'cchv_loc','cchv_date'], 'required', 'message' => 'Cannot be blank.'],			
			[['loc_code'], 'required', 'message' => 'Cannot be blank.'],	
			[['create_time', 'create_user', 'update_time', 'update_user'], 'integer', 'message' => 'Must be an integer'],
			
			[['cchv_q53',	'cchv_q54',	'cchv_q55',	'cchv_q56',	'cchv_q57',	'cchv_q58',	'cchv_q59',	'cchv_q60',	'cchv_q61',	'cchv_q62',	'cchv_q63',	'cchv_q64',	'cchv_q65',	'cchv_q66',	'cchv_q67',	'cchv_q68',	'cchv_q69',	'cchv_q70',	'cchv_q71',	'cchv_q72',	'cchv_q73',	'cchv_q74',	'cchv_q75',	'cchv_q76',	'cchv_q77',	'cchv_q78',	'cchv_q79',	'cchv_q80',	'cchv_q81',	'cchv_q82',	'cchv_q83',	'cchv_q84',	'cchv_q85',	'cchv_q86',	'cchv_q87',	'cchv_q88',	'cchv_q89',	'cchv_q90',	'cchv_q91',	'cchv_q92',	'cchv_q93',	'cchv_q94',	'cchv_q95',	'cchv_q96',	'cchv_q97',	'cchv_q98',	'cchv_q99',	'cchv_q100',	'cchv_q101',	'cchv_q102',	'cchv_q103',	'cchv_q104',	'cchv_q105',	'cchv_q106',	'cchv_q107',	'cchv_q108',	'cchv_q109',	'cchv_q110',	'cchv_q111',	'cchv_q112',	'cchv_q113',	'cchv_q114',	'cchv_q115',	'cchv_q116',	'cchv_q117',	'cchv_q118'], 'required', 'message' => 'Cannot be blank.'],	
            [['cchv_q119','cchv_q120','cchv_q121','cchv_q122'], 'safe'],			
				

            [['cchv_q55a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->cchv_q55 == 5;
			}, 'whenClient' => "function (attribute, value) {
				return $('#cchv-cchv_q55').val() == '5';
			}"],
			
			
            [['cchv_q58a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->cchv_q58 == 7;
			}, 'whenClient' => "function (attribute, value) {
				return $('#cchv-cchv_q58').val() == '7';
			}"],
			
			[['cchv_q101a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {
				return $model->cchv_q101 == 1;
			}, 'whenClient' => "function (attribute, value) {
				return $('#cchv-cchv_q101').val() == '1';
			}"],
			
			[['cchv_q56a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {		
			}, 'whenClient' => "function (attribute, value) {				
				return $('#cchv-cchv_q56-8').prop('checked');
			}"],

	       [['cchv_q61a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {		
			}, 'whenClient' => "function (attribute, value) {				
				return $('#cchv-cchv_q61-7').prop('checked');
			}"],
			
		    [['cchv_q99a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {		
			}, 'whenClient' => "function (attribute, value) {				
				return $('#cchv-cchv_q99-6').prop('checked');
			}"],
			
			[['cchv_q104a'], 'required', 'message' => 'Cannot be blank.', 'when' => function ($model) {		
			}, 'whenClient' => "function (attribute, value) {				
				return $('#cchv-cchv_q104-6').prop('checked');
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
			'cchv_id' => Yii::t('app', 'ID'),
			'cchv_survey' => Yii::t('app', 'Survey'),
			'cchv_pid' => Yii::t('app', 'Client ID'),
			'cchv_loc' => Yii::t('app', 'State'),
			'loc_code' => Yii::t('app', 'Location'),
			'cchv_date' => Yii::t('app', 'Date'),
			
'cchv_q53' => Yii::t('app','53.	Age range (years)'),
'cchv_q54' => Yii::t('app','54.	Sex assigned at birth'),
'cchv_q55' => Yii::t('app','55.	Gender identity'),
'cchv_q55a' => Yii::t('app','55a. Specify'),
'cchv_q56' => Yii::t('app','56.	Population category (select all that apply)'),
'cchv_q56a' => Yii::t('app','56a. Specify'),
'cchv_q57' => Yii::t('app','57.	Highest education level completed'),
'cchv_q58' => Yii::t('app','58.	Current occupation'),
'cchv_q58a' => Yii::t('app','58a. Specify'),
'cchv_q59' => Yii::t('app','59.	Household monthly income category (in Indian Rupees, INR)'),
'cchv_q60' => Yii::t('app','60.	Living setting'),
'cchv_q61' => Yii::t('app','61.	Housing characteristics (select all that apply)'),
'cchv_q61a' => Yii::t('app','61a. Specify'),
'cchv_q62' => Yii::t('app','62.	In the past 12 months, I have experienced extreme heat'),
'cchv_q63' => Yii::t('app','63.	In the past 12 months, I have experienced flooding'),
'cchv_q64' => Yii::t('app','64.	In the past 12 months, I have experienced drought or water scarcity'),
'cchv_q65' => Yii::t('app','65.	In the past 12 months, I have experienced cyclones or storms'),
'cchv_q66' => Yii::t('app','66.	In the past 12 months, I have experienced seasonal shifts in rainfall or temperature'),
'cchv_q67' => Yii::t('app','67.	These climate changes are worsening over time'),
'cchv_q68' => Yii::t('app','68.	These climate events have negatively affected my access to food'),
'cchv_q69' => Yii::t('app','69.	These climate events have negatively affected my access to water'),
'cchv_q70' => Yii::t('app','70.	These climate events have negatively affected my transportation'),
'cchv_q71' => Yii::t('app','71.	These climate events have negatively affected my personal safety'),
'cchv_q72' => Yii::t('app','72.	These climate events have made it harder for me to access health facilities'),
'cchv_q73' => Yii::t('app','73.	My household uses coping mechanisms like storing water or food during climate events'),
'cchv_q74' => Yii::t('app','74.	In the past 6–12 months, someone in my household has had a fever'),
'cchv_q75' => Yii::t('app','75.	In the past 6–12 months, someone in my household has had diarrheal diseases'),
'cchv_q76' => Yii::t('app','76.	In the past 6–12 months, someone in my household has had vector-borne diseases like malaria, dengue, or chikungunya'),
'cchv_q77' => Yii::t('app','77.	In the past 6–12 months, someone in my household has had respiratory infections'),
'cchv_q78' => Yii::t('app','78.	Health services were available during recent climate events like heatwaves or floods'),
'cchv_q79' => Yii::t('app','79.	I noticed an increase in infections after extreme weather like floods or heatwaves'),
'cchv_q80' => Yii::t('app','80.	I faced barriers like transportation issues when seeking care during climate shocks'),
'cchv_q81' => Yii::t('app','81.	Local outbreaks of diseases have increased in my community after climate events'),
'cchv_q82' => Yii::t('app','82.	Climate-related disruptions have affected my access to contraception'),
'cchv_q83' => Yii::t('app','83.	Climate-related disruptions have affected my access to maternal health services'),
'cchv_q84' => Yii::t('app','84.	Climate-related disruptions have affected my access to safe delivery care'),
'cchv_q85' => Yii::t('app','85.	Climate-related disruptions have affected my access to HIV/STI prevention and testing'),
'cchv_q86' => Yii::t('app','86.	SRH services have been interrupted due to transport breakdown, flooding, heat, or facility closures'),
'cchv_q87' => Yii::t('app','87.	I have noticed an increase in risky sexual behaviors linked to displacement or climate stress'),
'cchv_q88' => Yii::t('app','88.	STI symptoms have increased after climate shocks'),
'cchv_q89' => Yii::t('app','89.	Climate events have negatively impacted pregnancy outcomes, such as anemia or preterm delivery'),
'cchv_q90' => Yii::t('app','90.	During extreme weather events, I was able to reach health services'),
'cchv_q91' => Yii::t('app','91.	Essential medicines were available during extreme weather events'),
'cchv_q92' => Yii::t('app','92.	Waiting times at health facilities increased due to climate disruptions'),
'cchv_q93' => Yii::t('app','93.	Service costs at health facilities increased due to climate disruptions'),
'cchv_q94' => Yii::t('app','94.	I missed follow-up visits or treatment appointments due to climate events'),
'cchv_q95' => Yii::t('app','95.	The supply of clean water in health facilities was reliable during climate events'),
'cchv_q96' => Yii::t('app','96.	The supply of electricity in health facilities was reliable during climate events'),
'cchv_q97' => Yii::t('app','97.	The supply of sanitation in health facilities was reliable during climate events'),
'cchv_q98' => Yii::t('app','98.	Have you used any antibiotics in the past 6 months?'),
'cchv_q99' => Yii::t('app','99.	What was the main reason for taking antibiotics? (Select all that apply)'),
'cchv_q99a' => Yii::t('app','99a. Specify'),
'cchv_q100' => Yii::t('app','100. Who advised or prescribed the antibiotics?'),
'cchv_q101' => Yii::t('app','101. Do you recall the name or type of antibiotic used?'),
'cchv_q101a' => Yii::t('app','101a. Specify'),
'cchv_q102' => Yii::t('app','102. What was the duration of antibiotic use?'),
'cchv_q103' => Yii::t('app','103. Were you able to complete the full prescribed course?'),
'cchv_q104' => Yii::t('app','104. If you did not complete the course, what was the main reason? (Select all that apply)'),
'cchv_q104a' => Yii::t('app','104a. Specify'),
'cchv_q105' => Yii::t('app','105. Have you ever stored leftover antibiotics or shared them with others?'),
'cchv_q106' => Yii::t('app','106. Did climate-related events (e.g., floods, heatwaves) influence your decision to use antibiotics?'),
'cchv_q107' => Yii::t('app','107. Have you heard about antibiotic resistance or treatment failure in your community?'),
'cchv_q108' => Yii::t('app','108. Has a healthcare provider ever explained proper antibiotic use or antibiotic resistance to you?'),
'cchv_q109' => Yii::t('app','109. Climate shocks have caused income loss in my household'),
'cchv_q110' => Yii::t('app','110. Climate shocks have caused displacement in my household'),
'cchv_q111' => Yii::t('app','111. Climate shocks have caused food insecurity in my household'),
'cchv_q112' => Yii::t('app','112. These climate factors have limited my access to healthcare or medicines'),
'cchv_q113' => Yii::t('app','113. My gender, age, stigma, or sexual identity has affected my ability to access health services during climate crises'),
'cchv_q114' => Yii::t('app','114. (For MSM/PWID only; skip if not applicable) Climate-related police activity, shelter disruption, or stigma has limited my health access'),
'cchv_q115' => Yii::t('app','115. Local health systems are prepared for climate impacts'),
'cchv_q116' => Yii::t('app','116. My community receives climate-related health warnings'),
'cchv_q117' => Yii::t('app','117. There are community programs to support vulnerable groups during climate disasters'),
'cchv_q118' => Yii::t('app','118. More support, like better warnings or supplies, is needed to improve climate-health resilience'),
'cchv_q119' => Yii::t('app','119. In your opinion, what is the biggest health problem caused by climate change in your area?'),
'cchv_q120' => Yii::t('app','120. How has climate change most affected your family’s wellbeing?'),
'cchv_q121' => Yii::t('app','121. What changes would improve your climate-health resilience?'),
'cchv_q122' => Yii::t('app','122. Any additional comments?'),

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
		 $this->cchv_pid = strtoupper($this->cchv_pid);		 
			 if($this->cchv_date != "")
				$this->cchv_date = Converter::toStore($this->cchv_date);
			
	        return true;
	    } else {
	        return false;
	    }
	}
	
	public function afterFind()
	{
		parent::afterFind();
		
		if(Yii::$app->controller->action->id != "index" && Yii::$app->controller->action->id != "view") {			
		    if($this->cchv_date != "")
				$this->cchv_date = Converter::toDisplay($this->cchv_date);
		}
		
		if(Yii::$app->controller->action->id == "update" ) {
			$this->cchv_q56 = explode(",", $this->cchv_q56);
			$this->cchv_q61 = explode(",", $this->cchv_q61);
			$this->cchv_q99 = explode(",", $this->cchv_q99);
			$this->cchv_q104 = explode(",", $this->cchv_q104);
		}
	}
	
		
	
}

