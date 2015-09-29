Curated Artifact Catalog
===

This Sparkl plugin provides a dashboard showing users what resources they can currently view, in a more accesible way. Instead of a tree of folders and files, the content is divided into sections and resources.

Sections are hierarchical tags, such as "Invoices" or "Sales", that can be optionally limited to certain roles and nested inside each other. Resources are extended descriptions of existing reports or dashboards, which are listed according to the ACL rules in Pentaho.

A resource can belong to zero or more sections, and sections can be nested. A report or a dashboard can only be described in one resource.

To see CAC in action, check the screencasts available on [YouTube](https://www.youtube.com/playlist?list=PL7XShKQaDPA1dKLiiYuOULn9mUaZk4u4C).

Assumptions
--

The plugin assumes that admin users have the Administrator role and logged-in users have the Authenticated role, as in the default Pentaho setup. This is currently not configurable, sorry!

This plugin has been tested with Pentaho 5.4.0.1 CE.

Installation
--

1. Clone the project outside of your Pentaho installation, and create a symlink to the `artifactCatalog` subfolder in your `pentaho-solutions/system` folder:

       cd /path/to/pentaho-solutions/system
       ln -s /path/to/pentaho-artifactCatalog artifactCatalog

2. Install the Community File Repository (CFR) plugin from the Marketplace.  We require it for uploading images from the resource and section management dashboards, and (by default) to serve them.

3. Install the `mogrify` tool into some directory in your `PATH`. This tool is used to resize uploaded images into the 375x200px size expected by the UI. In most Linux distributions, this tool is bundled into the `imagemagick` package, and in Mac OS X it is available through MacPorts as `ImageMagick`. There are also binary releases for [Windows](http://www.imagemagick.org/script/binary-releases.php#windows).

4. Create the PostgreSQL database in `database/postgres9-ddl.sql` and add it as a JDBC data source in Pentaho, noting down its name. This database stores the sections and resources created through the admin-only endpoints. On Ubuntu 15.04, these commands can be used:

      sudo -u postgres createuser -P artcat
      sudo -u postgres createdb -O artcat artifact_catalog
      sudo -u postgres psql -h localhost \
        artifact_catalog artcat < database/postgres9-ddl.sql

5. Copy `config.yaml.template` to `config.yaml` and customise it: specify the JNDI name of the JDBC data source in `jndi`, check the URL components for the Pentaho REST API and fine-tune the regular expressions for including and excluding artifacts for the admin-only section and resource forms.  `cfrUploadDirectory` should be set to the absolute path to the directory where CFR stores its uploads: this usually should be the `.cfr` subfolder of your `pentaho-solutions/system` directory.

   If you want to use a separate web server to host your images, instead of CFR, you will need to customize `imagesDirectory` and `imagesBaseURL`. These should be set to the absolute path and base URL of the directory from which you will serve the static images.  `cfrGrantRead` should be set to `false` in this scenario.

   If you need to change your `baseURI`, make sure that you set `myself.apiPrefix` to the same value in `static/custom/js/artifactCatalog.js`!

6. Provide the username and password of an Administrator in your `~/.kettle/kettle.properties` file. This file should only be readable by the user running Pentaho, for security reasons. For a stock Pentaho CE install, they would look like this:

         ARTIFACTCATALOG_RESTAPI_USER=Admin
         ARTIFACTCATALOG_RESTAPI_PWD=password

   These are only used for admin-only endpoints.

   *NOTE*: the BI Server or Kettle only load the `kettle.properties` on startup, so you will need to restart them if they are running.

7. Edit your `pentaho-solutions/system/applicationContext-spring-security.xml` file so the endpoint for the main dashboard has the same security filters as a regular Pentaho page. The `filterInvocationDefinitionSource` property in the `filterChainProxy` bean has to be edited, adding at the beginning a pattern with the right URL and the same filters as for the `/**` pattern. It would look something like this (ignore the `...`):

        <property name="filterInvocationDefinitionSource">
          <value>
            <![CDATA[CONVERT_URL_TO_LOWERCASE_BEFORE_COMPARISON
            PATTERN_TYPE_APACHE_ANT
           /plugin/artifactcatalog/api/artifactcatalog=securityContextHolderAwareRequestFilter,httpSessionPentahoSessionContextIntegrationFilter,httpSessionContextIntegrationFilter,httpSessionReuseDetectionFilter,logoutFilter,authenticationProcessingFilter,basicProcessingFilter,requestParameterProcessingFilter,anonymousProcessingFilter,exceptionTranslationFilter,filterInvocationInterceptor
           /webservices/**=...
            /api/**=...
            /plugin/**=...
            /**=securityContextHolderAwareRequestFilter,httpSessionPentahoSessionContextIntegrationFilter,httpSessionContextIntegrationFilter,httpSessionReuseDetectionFilter,logoutFilter,authenticationProcessingFilter,basicProcessingFilter,requestParameterProcessingFilter,anonymousProcessingFilter,exceptionTranslationFilter,filterInvocationInterceptor]]>
          </value>
        </property>

8. As an admin, go to _Tools < ArtifactCatalog_ and run the main `artifactcatalog` dashboard. This dashboard is also available to end users at the same URL. However, the edit buttons, dashboards and Kettle endpoints are limited to administrators.

9. Customize `dashboards/*.properties` to provide your own welcome text and title for the catalog, and replace `static/custom/img/logo.png` with your company logo (default size is 64 x 64 pixels). For changing the colors of the page, `static/custom/css/artifactCatalog.css` should be customized.
