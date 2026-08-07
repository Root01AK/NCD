<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Bsr;
use app\base\Converter;

/**
 * BsrSearch represents the model behind the search form about `app\models\Bsr`.
 */
class BsrSearch extends Bsr
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['bsr_id', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['bsr_survey', 'bsr_date', 'bsr_pid', 'bsr_loc', 'bsr_random_sugar', 'bsr_tot_cholesterol', 'bsr_triglycerides', 'bsr_hdl', 'bsr_ldl', 'bsr_creatinine', 'bsr_urea', 'bsr_tot_bilirubin', 'bsr_sgot', 'bsr_sgpt', 'bsr_tot_protein', 'bsr_albumin','status','record_date'], 'safe'],
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
		   $query = Bsr::find();
	    else
		  $query = Bsr::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'bsr_date'=> SORT_DESC]
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
            'bsr_id' => $this->bsr_id,           
            'bsr_date' => Converter::toUnixTimeformat($this->bsr_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'bsr_survey', $this->bsr_survey])
            ->andFilterWhere(['like', 'bsr_pid', $this->bsr_pid])
            ->andFilterWhere(['like', 'bsr_loc', $this->bsr_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}