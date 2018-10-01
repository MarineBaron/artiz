<?php
/* Copyright (C) 2018 SuperAdmin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * \file    comartiz/class/artizcall_comartiz.class.php
 * \ingroup comartiz
 * \brief   Artiz CallApi
 *
 * Put detailed description here.
 */

/**
 * Class ArtizCallComArtiz
 */
class ArtizCallComArtiz
{
    /**
     * @var DoliDB Database handler.
     */
    protected $db;
    /**
     * @var Conf Conf.
     */
    protected $conf;
    /**
     * @var User User connected.
     */
    protected $user;
    /**
    * @var string artizUrl
    */
    protected $artizUrl = '';
    /**
     * @var string dolTypeObject
     */
    protected $dolTypeObject = '';
    /**
    * @var string action
    */
    protected $action = '';


    /**
    * @var  object
    */
    protected $object;
    /**
    * @var string curlMethod
    */
    protected $curlMethod;
    /**
    * @var string curlUrl
    */
    protected $curlUrl;
    /**
    * @var string curlData
    */
    protected $curlData;
    /**
    * @var array curlHeaders
    */
    protected $curlHeaders;


    /**
    * @var boolean Error
    */
    protected $error = 0;
    /**
     * @var string result
     */
    protected $result = '';


  /**
   * Constructor
   *
   *  @param		DoliDB		$db     Database handler
   *  @param    Conf 			$conf 	Object Conf
   *  @param    User 			$user 	Object User
   */
  	public function __construct($db, Conf $conf, User $user)
  	{
  	    $this->db = $db;
        $this->conf = $conf;
        $this->user = $user;
        $this->artizUrl = $conf->global->COMARTIZ_ARTIZ_URL;
  	}


	/**
	 * Execute action
	 *
	 * @param	string			$dolTypeObject		type of objevt
	 * @param	string			$action      	'update', 'delete'
   * @param	    $object         The object to process (an invoice if you are in invoice module, a propale in propale's module, etc...)
	 * @return	int         					<0 if KO,
	 *                           				=0 if OK but we want to process standard actions too,
	 *                            				>0 if OK and we want to replace standard actions.
	 */
  	public function call(string $dolTypeObject, string $action, $object)
  	{
      $this->dolTypeObject = $dolTypeObject;
      $this->action = $action;
      $this->object = $object;

      $this->setCurlHeaders();
      $this->setArtizApiUrl();
      $this->setCurlMethod();
      $this->setDataFromObject();
      // dol_syslog("COMARTIZ - action " . $this->action);
      //dol_syslog("COMARTIZ - url " . $this->curlUrl);
      // dol_syslog("COMARTIZ - method " . $this->curlUrl);

      $this->send();

      dol_syslog("COMARTIZ - " . $this->result, $this->error ? LOG_ERR : LOG_INFO);
      return 0;
  	}

    /**
     * Curl Send Request
     *
     */
    private function send()
    {
      dol_syslog($this->curlUrl);
      $curl = curl_init($this->curlUrl);
      curl_setopt($curl, CURLOPT_HTTPHEADER, $this->curlHeaders);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($this->curlData));
      curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $this->curlMethod);


      $response = curl_exec($curl);
      $data = json_decode($response);

      /* Check for 404 (file not found). */
      $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

      $this->result = "Return from ArtizAPI : ";
      $this->error = 1;
      // Check the HTTP Status code
      switch ($httpCode) {
          case 200:
              $this->result .= "200: Success";
              $this->error = 0;
              break;
          case 401:
              $this->result .= "401: UnAuthorized";
              break;
          case 404:
              $this->result .= "404: API Not found";
              break;
          case 500:
              $this->result .= "500: servers replied with an error.";
              break;
          case 502:
              $this->result .= "502: servers may be down or being upgraded. Hopefully they'll be OK soon!";
              break;
          case 503:
              $this->result .= "503: service unavailable. Hopefully they'll be OK soon!";
              break;
          default:
              $this->result .= "Undocumented error: " . $httpCode . " : " . curl_error($curl);
              break;
      }
      curl_close($curl);
    }

    /**
     * Set data from object
     *
     * @return	\StdClass
     */
    private function setDataFromObject()
    {
      switch($this->dolTypeObject) {
        case 'societe':
          $this->curlData = $this->transSociete();
        break;
        case 'propale':
          $this->curlData = $this->transPropale();
        break;
        case 'linepropale':
          $this->curlData = $this->transLinePropale();
        break;
        case 'admincompany':
          $this->curlData = $this->transCompany();
        break;
        default:
          $this->curlData = new \StdClass;
        break;
      }
    }

    /**
     * Get data from Societe
     *
     * @return	\StdClass
     */
    private function transSociete()
    {
      $obj = new \StdClass;
      $obj->name = $this->object->nom;

      return $obj;
    }

    /**
     * Get data from Compagny
     *
     * @return	\StdClass
     */
    private function transCompany()
    {
      $obj = new \StdClass;
      $obj->name = $this->object->name;

      return $obj;
    }

    /**
     * Get data from Propale
     *
     * @return	\StdClass
     */
    private function transPropale()
    {
      $obj = new \StdClass;
      if (isset($this->object->note_public))
      {
        $obj->name = $this->object->note_public;
      }
      $obj->isErpSync = true;

      return $obj;
    }

    /**
     * Get data from LinePropale
     *
     * @return	\StdClass
     */
    private function transLinePropale()
    {
      $obj = new \StdClass;
      $obj->isErpSync = false;

      return $obj;
    }

    /**
     * Get url
     *
     */
    private function setArtizApiUrl()
    {
      $url = '';
      switch($this->dolTypeObject) {
        case 'societe':
          $url .= '/user/fromerp/client/' . $this->object->id;
        break;
        case 'admincompany':
          $url .= '/user/fromerp/artisan';
        break;
        case 'propale':
          $url .= '/project/fromerp/' . $this->object->id;
        break;
        case 'linepropale':
          $url .= '/project/fromerp/' . $this->object->fk_propal;
        break;
      }
      $this->curlUrl = $this->artizUrl . $url;
    }

    /**
     * Set Curl Method
     *
     */
    private function setCurlMethod()
    {
      switch($this->action) {
        case 'update':
          $this->curlMethod = 'PUT';
        break;
        case 'delete':
          $this->curlMethod = 'DELETE';
        break;
      }
    }

    /**
     * Set Curl Headers
     *
     */
    private function setCurlHeaders()
    {
      $this->curlHeaders = [
        'Content-Type: application/json',
        'ERPAPIKEY:'.$this->user->api_key
      ];
    }


}
