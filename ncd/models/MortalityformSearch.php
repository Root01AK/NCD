<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Mortalityform;
use app\base\Converter;
use app\models\Users;

/**
 * MortalityformSearch represents the model behind the search form about `app\models\Mortalityform`.
 */
class MortalityformSearch extends Mortalityform
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['mortality_form_id', 'mortality_form_q3', 'mortality_form_q4', 'mortality_form_q5', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['mortality_form_survey', 'mortality_form_part_id', 'mortality_form_q1', 'mortality_form_q2', 'status','record_date'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        // bypass scenarios() implementation in the parent class
        return Model::scenarios();
    }

    /**
     * Creates data provider instance with search query applied
     *
     * @param array $params
     *
     * @return ActiveDataProvider
     */
    public function search($params)
    {
        
		$sloc=Yii::$app->user->identity->signedin_loc;
		$suser=Yii::$app->user->identity->users_name;
		
		$Usermodel = Users::find()->where(['users_name' => $suser])->one();			   
		$UserRole= $Usermodel->user_role;	
		
		if($UserRole == 1) 
		   $query = Mortalityform::find();
	    else
		  $query = Mortalityform::find()->where(['loc_code'=>$sloc]); 
	  
        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC],
            ],
        ]);
		if(empty($params))
            $params = Yii::$app->request->post();

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'mortality_form_id' => $this->mortality_form_id,
            'mortality_form_q3' => $this->mortality_form_q3,
            'mortality_form_q4' => $this->mortality_form_q4,
            'mortality_form_q5' => $this->mortality_form_q5,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'mortality_form_survey', $this->mortality_form_survey])
            ->andFilterWhere(['like', 'mortality_form_part_id', $this->mortality_form_part_id])
            ->andFilterWhere(['like', 'mortality_form_q1', $this->mortality_form_q1])
            ->andFilterWhere(['like', 'mortality_form_q2', $this->mortality_form_q2])
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}