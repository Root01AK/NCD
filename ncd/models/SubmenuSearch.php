<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Submenu;

/**
 * SubmenuSearch represents the model behind the search form about `app\models\Submenu`.
 */
class SubmenuSearch extends Submenu
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['sub_mnu_id', 'min_mnu_id_fk', 'sub_mnu_preference', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['sub_mnu_name', 'sub_mnu_desc', 'status','record_date'], 'safe'],
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
        $query = Submenu::find();

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
            'sub_mnu_id' => $this->sub_mnu_id,
            'min_mnu_id_fk' => $this->min_mnu_id_fk,
            'sub_mnu_preference' => $this->sub_mnu_preference,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
        ]);

        $query->andFilterWhere(['like', 'sub_mnu_name', $this->sub_mnu_name])
            ->andFilterWhere(['like', 'sub_mnu_desc', $this->sub_mnu_desc])
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}
