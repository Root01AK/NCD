<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Fupm;
use app\base\Converter;

/**
 * FupmSearch represents the model behind the search form about `app\models\Fupm`.
 */
class FupmSearch extends Fupm
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['fupm_id', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['fupm_survey', 'fupm_date', 'fupm_pid', 'fupm_loc', 'fupm_q7','status','record_date'], 'safe'],
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
		   $query = Fupm::find();
	    else
		  $query = Fupm::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'fupm_date'=> SORT_DESC]
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
            'fupm_id' => $this->fupm_id,           
            'fupm_date' => Converter::toUnixTimeformat($this->fupm_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'fupm_survey', $this->fupm_survey])
            ->andFilterWhere(['like', 'fupm_pid', $this->fupm_pid])
            ->andFilterWhere(['like', 'fupm_loc', $this->fupm_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}