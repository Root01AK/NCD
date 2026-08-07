<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Locationmaster;
use app\models\Users;

/**
 * LocationmasterSearch represents the model behind the search form about `app\models\Users`.
 */
class LocationmasterSearch extends Locationmaster
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['loc_id', 'create_user', 'update_user'], 'integer'],
            [['loc_code', 'loc_name','state_code', 'status', 'create_time', 'update_time','record_date'], 'safe'],
        ];
    }

    /**
     * @inheritdocloc_id
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
		   $query = Locationmaster::find();
	    else
		  $query = Locationmaster::find()->where(['loc_code'=>$sloc]); 
	  
        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['loc_id'=> SORT_ASC],
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
            'loc_id' => $this->loc_id,
            'status' => $this->status,			
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,           
        ]);

        $query->andFilterWhere(['like', 'loc_code', $this->loc_code])		      
		      ->andFilterWhere(['like', 'loc_name', $this->loc_name]);          
           
        return $dataProvider;
    }
}
