<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Menuprivileges;

/**
 * MenuprivilegesSearch represents the model behind the search form about `app\models\Menuprivileges`.
 */
class MenuprivilegesSearch extends Menuprivileges
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['mnu_acs_id', 'mnu_acs_usr_id_fk', 'mnu_acs_mnu_id_fk', 'mnu_acs_sub_mnu_id_fk', 'mnu_acs_usr_status', 'mnu_acs_add', 'mnu_acs_edit', 'mnu_acs_delete', 'create_user', 'update_user'], 'integer'],
            [['status', 'create_time', 'update_time','record_date'], 'safe'],
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
        $query = Menuprivileges::find();

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
            'mnu_acs_id' => $this->mnu_acs_id,
            'mnu_acs_usr_id_fk' => $this->mnu_acs_usr_id_fk,
            'mnu_acs_mnu_id_fk' => $this->mnu_acs_mnu_id_fk,
            'mnu_acs_sub_mnu_id_fk' => $this->mnu_acs_sub_mnu_id_fk,
            'mnu_acs_usr_status' => $this->mnu_acs_usr_status,
            'mnu_acs_add' => $this->mnu_acs_add,
            'mnu_acs_edit' => $this->mnu_acs_edit,
            'mnu_acs_delete' => $this->mnu_acs_delete,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
        ]);

        $query->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}
