Curated Artifact Catalog
===

This Pentaho plugin provides a dashboard showing users what resources they can currently view, in a more accesible way. Instead of a tree of folders and files, the content is divided into sections and resources.

Sections are hierarchical tags, such as "Invoices" or "Sales", that can be optionally limited to certain roles and nested inside each other. Resources are extended descriptions of existing reports or dashboards, which are listed according to the ACL rules in Pentaho. A resource can belong to zero or more sections, and a report or a dashboard can only be described in one resource.

To see CAC in action, check the screencasts available on [YouTube](https://www.youtube.com/playlist?list=PL7XShKQaDPA1dKLiiYuOULn9mUaZk4u4C).

The development of this plugin has been funded through the research project "Data quality improvement and business intelligence platform for decision support" ("Mejora de la calidad de los datos y sistema de inteligencia empresarial para la toma de decisiones", 2013-031/PV/UCA-G/PR) of the University of Cádiz.

Assumptions
--

The plugin assumes that admin users have the Administrator role and logged-in users have the Authenticated role, as in the default Pentaho setup. This is currently not configurable, sorry!

This plugin has been tested with Pentaho 6.0.0 CE and three different database engines: HSQLDB 2.x (included with Pentaho), PostgreSQL 9.4 and MySQL 5.6.7.

Minimal installation from source
--

This installation uses the built-in HSQLDB database in a stock Pentaho install to store the catalog, and uses the CFR upload directory to store images.

1. Go to the Pentaho User Console, go to "File > Manage Data Sources..." and edit the `SampleData` JDBC datasource to make it use the `pentaho_admin` user. ArtifactCatalog needs a user that can create tables, and the default `pentaho_user` user cannot do that.

2. Clone the project outside of your Pentaho installation, and create a symlink to the `artifactCatalog` subfolder in your `pentaho-solutions/system` folder:

         cd /path/to/pentaho-solutions/system
         ln -s /path/to/pentaho-artifactCatalog artifactCatalog

3. Install the Community File Repository (CFR) plugin from the Marketplace.  We require it for uploading images from the resource and section management dashboards, and (by default) to serve them.

4. Copy `config.yaml.template` to `config.yaml`.

5. Restart Pentaho.

6. As an admin, go to _Tools > ArtifactCatalog_ and run the main `artifactcatalog` dashboard. This dashboard is also available to end users at the same URL. However, the edit buttons, dashboards and Kettle endpoints are limited to administrators.

7. We heavily recommend installing `mogrify` if you can (see "Image resizing" below).

8. We also recommend configuring Pentaho to make users authenticate through the Pentaho web-based form, instead of an ugly HTTP Basic form. See "Web-based authentcation" below.

Customization options
--

By default, the plugin uses the "SampleData" HSQLDB database that
comes with Pentaho. To use it, make sure you edit the SampleData data
source within the Pentaho User Console and change the user to
`pentaho_admin` (as the default `pentaho_user` does not have DBA
rights on it). If you'd like to use a different database, edit
`config.yaml` and change `jndi` to the name of the Pentaho data source
to be used and `ddlFile` to the appropriate file within the `database`
directory. Make sure that the user used in the connection has the
ability to create tables in the database, and the plugin will take
care of the rest.

Check the regular expressions for including and excluding artifacts
for the admin-only section and resource forms.  `cfrUploadDirectory`
should be set to the absolute path to the directory where CFR stores
its uploads: this usually should be the `.cfr` subfolder of your
`pentaho-solutions/system` directory.

If you want to use a separate web server to host your images instead
of CFR, you will need to customize `imagesDirectory` and
`imagesBaseURL`. These should be set to the absolute path and base URL
of the directory from which you will serve the static images.
`cfrGrantRead` should be set to `false` in this scenario. Make sure
that the user running Pentaho has write rights on `imagesDirectory`.

Image resizing
--

If you have `mogrify` available in some directory in your `PATH`,
ArtifactCatalog will use it to resize uploaded images into the
375x200px size expected by the UI. In most Linux distributions, this
tool is bundled into the `imagemagick` package, and in Mac OS X it is
available through MacPorts as `ImageMagick`. There are also binary
releases for
[Windows](http://www.imagemagick.org/script/binary-releases.php#windows).

Company image
--

Optionally, you can customize `dashboards/*.properties` to provide
your own welcome text and title for the catalog, and replace
`static/custom/img/logo.png` with your company logo (default size is
64 x 64 pixels). For changing the colors of the page,
`static/custom/css/artifactCatalog.css` should be customized.

_Note_: you may need to clean the `.properties` cache in CDF for these
changes to be effective, by deleting the
`pentaho-solutions/system/pentaho-cdf-dd/tmp/.cache/system/artifactCatalog`
directory.

Web-based authentication
--

If you want users that go straight to this dashboard to authenticate through the default web-based form, you will need to edit `pentaho-solutions/system/applicationContext-spring-security.xml` so the endpoint for the main dashboard has the same security filters as a regular Pentaho page. This way, instead of an ugly HTTP Basic auth form you will get the default Pentaho login form. The `filterInvocationDefinitionSource` property in the `filterChainProxy` bean has to be edited, adding at the beginning a pattern with the right URL and the same filters as for the `/**` pattern. It would look something like this (ignore the `...`):

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
