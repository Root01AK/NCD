<?php

namespace app\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\base\NotSupportedException;
use yii\db\ActiveRecord;
use yii\helpers\Security;
use yii\web\IdentityInterface;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "{{%users}}".
 *
 * @property integer $usr_id
 * @property string $users_name
 * @property string $password
 * @property string $auth_key
 * @property string $password_reset_token
 * @property string $full_name
 * @property string $email
 * @property string $status
 * @property string $create_time
 * @property integer $create_user
 * @property string $update_time
 * @property integer $update_user
 * @property integer $user_type
 */
class Users extends ActiveRecord implements IdentityInterface
{
    const STATUS_ACTIVE = 1;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%users}}';
    }

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::class,
                'createdAtAttribute' => 'create_time',
                'updatedAtAttribute' => 'update_time',
                'value' => date('U'),
            ]
        ];
    }
	
	public $selectall;
	
	public $userrole = [1 => "Admin", 2 => "Manager", 3 => "DEO"];

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['users_name', 'full_name','loc_code','user_role'], 'required'],
			[['signedin_loc', 'state_code'], 'safe'],
            ['password', 'required', 'on' => 'create'],
            ['password', 'safe', 'on' => 'update'],
            [['password'], 'string'],
            [['create_time', 'update_time'], 'safe'],
            [['create_user', 'update_user', 'user_type'], 'integer'],
            [['users_name'], 'string', 'max' => 64],
            [['full_name'], 'string', 'max' => 50],
            [['email'], 'string', 'max' => 320],
            [['status'], 'string', 'max' => 1],
            [['users_name'], 'unique'],
			[['record_date'], 'default', 'value' => strtotime(date('Y/m/d'))],
			
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'usr_id' => 'Usr ID',
            'users_name' => 'Username',
            'password' => 'Password',
            'auth_key' => Yii::t('app', 'Auth Key'),
            'password_reset_token' => Yii::t('app', 'Password Reset Token'),
            'full_name' => 'Full Name',
            'email' => 'Email',
			'user_role' => 'User Role',
            'status' => 'Status',
            'create_time' => 'Create Time',
            'create_user' => 'Create User',
            'update_time' => 'Update Time',
            'update_user' => 'Update User',
            'user_type' => 'User Type',
			'loc_code' => 'Location',
        ];
    }

    public function beforeSave($insert)
    {
        if (parent::beforeSave($insert)) {
            // Only hash password if provided as plain text (not already a 32-char hex MD5 hash)
            if (!empty($this->password)) {
                if ($insert || $this->isAttributeChanged('password')) {
                    if (!preg_match('/^[a-f0-9]{32}$/i', $this->password)) {
                        $this->setPassword($this->password);
                    }
                }
            }
            
            if (empty($this->auth_key)) {
                $this->generateAuthKey();
            }
            return true;
        }
        return false;
    }

    /**
     * @inheritdoc
     */
    public static function findIdentity($id)
    {
        return static::findOne(['code' => $id, 'status' => self::STATUS_ACTIVE]);
    }

    /**
     * @inheritdoc
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        throw new NotSupportedException('"findIdentityByAccessToken" is not implemented.');
    }

    /**
     * Finds user by username
     *
     * @param string $username
     * @return static|null
     */
    public static function findByUsername($username)
    {
        return static::findOne(['users_name' => $username, 'status' => self::STATUS_ACTIVE]);
    }

    /**
     * Finds user by password reset token
     *
     * @param string $token password reset token
     * @return static|null
     */
    public static function findByPasswordResetToken($token)
    {
        if (!static::isPasswordResetTokenValid($token)) {
            return null;
        }

        return static::findOne([
            'password_reset_token' => $token,
            'status' => self::STATUS_ACTIVE,
        ]);
    }

    /**
     * Finds out if password reset token is valid
     *
     * @param string $token password reset token
     * @return boolean
     */
    public static function isPasswordResetTokenValid($token)
    {
        if (empty($token)) {
            return false;
        }

        $timestamp = (int) substr($token, strrpos($token, '_') + 1);
        $expire = Yii::$app->params['user.passwordResetTokenExpire'];
        return $timestamp + $expire >= time();
    }

    /**
     * @inheritdoc
     */
    public function getId()
    {
        return $this->getPrimaryKey();
    }

    /**
     * @inheritdoc
     */
    public function getAuthKey()
    {
        return $this->auth_key;
    }

    /**
     * @inheritdoc
     */
    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    /**
     * Validates password
     *
     * @param string $password password to validate
     * @return boolean if password provided is valid for current user
     */
    public function validatePassword($password)
    {
        return $this->password === md5($password);
        // return Yii::$app->security->validatePassword($password, $this->password);
    }

    /**
     * Generates password hash from password and sets it to the model
     *
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password = md5($password);
        // $this->password = Yii::$app->security->generatePasswordHash($password);
    }

    /**
     * Generates "remember me" authentication key
     */
    public function generateAuthKey()
    {
        $this->auth_key = Yii::$app->security->generateRandomString();
    }

    /**
     * Generates new password reset token
     */
    public function generatePasswordResetToken()
    {
        $this->password_reset_token = Yii::$app->security->generateRandomString() . '_' . time();
    }

    /**
     * Removes password reset token
     */
    public function removePasswordResetToken()
    {
        $this->password_reset_token = null;
    }

    public function getName(){
        return $this->full_name .' '. $this->middle_name .' '. $this->first_name;
    }
	
	public static function findByLoc($username,$loccode)
    {
			
      // return static::findOne(['users_name' => $username, 'loc_code' => $loccode ,'status' => self::STATUS_ACTIVE]);	   
	  return static::find()->where(['users_name' => $username, 'status' => self::STATUS_ACTIVE])->andWhere(['like','loc_code','%'.$loccode.'%',false])->one();
	  
	  //return static::find()->where(['users_name' => $username, 'status' => self::STATUS_ACTIVE])->andWhere([
	 // 'loc_code' => $loccode])->one();		
		
    }
	
	public function afterFind()
	{
		parent::afterFind();
		if(Yii::$app->controller->action->id == "update") {
			if($this->loc_code != "")
                $this->loc_code = explode(",", $this->loc_code);            
		}
	}
		
}
