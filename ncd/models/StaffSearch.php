<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Users;
use app\models\Staff;

/**
 * StaffSearch represents the model behind the search form about `app\models\Users`.
 */
class StaffSearch extends Staff
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['staff_id', 'create_user', 'update_user'], 'integer'],
            [['staff_name','staff_code', 'status', 'create_time', 'update_time','record_date'], 'safe'],
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
		
        $query = Staff::find();		  

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['staff_id'=> SORT_ASC],
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
            'staff_id' => $this->staff_id,
            'status' => $this->status,			
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,           
        ]);

        $query->andFilterWhere(['like', 'staff_code', $this->staff_code])
		      ->andFilterWhere(['like', 'staff_name', $this->staff_name]);		
           
        return $dataProvider;
    }
}
